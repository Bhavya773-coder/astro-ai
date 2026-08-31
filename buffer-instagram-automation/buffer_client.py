import time
import random
import logging
import requests
from requests.exceptions import Timeout, RequestException

logger = logging.getLogger("buffer_scheduler")

class BufferAPIError(Exception):
    """Base class for all Buffer API errors."""
    def __init__(self, message, is_temporary=False):
        super().__init__(message)
        self.message = message
        self.is_temporary = is_temporary

class BufferClient:
    """Official Buffer GraphQL API Client."""
    
    BASE_URL = "https://api.buffer.com"
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Buffer API Key / Access Token is required.")
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

    def _execute(self, query: str, variables: dict = None, max_attempts: int = 3) -> dict:
        """Executes a GraphQL query/mutation with exponential backoff and jitter for temporary failures."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        delay = 5.0
        for attempt in range(1, max_attempts + 1):
            try:
                logger.debug(f"Executing GraphQL request (attempt {attempt}/{max_attempts})...")
                response = requests.post(
                    self.BASE_URL,
                    json=payload,
                    headers=self.headers,
                    timeout=30
                )
                
                # Check for rate limiting or server errors
                status_code = response.status_code
                
                if status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    wait_time = float(retry_after) if retry_after and retry_after.isdigit() else delay
                    # Add jitter
                    wait_time += random.uniform(0.5, 2.0)
                    logger.warning(f"Rate limited (HTTP 429). Waiting {wait_time:.2f}s before retry...")
                    time.sleep(wait_time)
                    delay *= 3  # Increase backoff
                    continue
                    
                if status_code in [500, 502, 503, 504]:
                    wait_time = delay + random.uniform(0.5, 2.0)
                    logger.warning(f"Temporary server error (HTTP {status_code}). Waiting {wait_time:.2f}s before retry...")
                    time.sleep(wait_time)
                    delay *= 3
                    continue
                    
                response.raise_for_status()
                
                # Verify GraphQL response
                result = response.json()
                if "errors" in result:
                    # Check if errors are temporary or permanent
                    err_msg = "; ".join([e.get("message", "Unknown GraphQL error") for e in result["errors"]])
                    is_temp = any(word in err_msg.lower() for word in ["timeout", "throttled", "temporary", "rate limit", "busy"])
                    raise BufferAPIError(f"GraphQL Errors: {err_msg}", is_temporary=is_temp)
                    
                return result
                
            except (Timeout, ConnectionError) as exc:
                wait_time = delay + random.uniform(0.5, 2.0)
                logger.warning(f"Network timeout or connection error: {exc}. Waiting {wait_time:.2f}s before retry...")
                if attempt == max_attempts:
                    raise BufferAPIError(f"Network error after {max_attempts} attempts: {exc}", is_temporary=True)
                time.sleep(wait_time)
                delay *= 3
                
            except BufferAPIError as exc:
                if exc.is_temporary and attempt < max_attempts:
                    wait_time = delay + random.uniform(0.5, 2.0)
                    logger.warning(f"Temporary API Error: {exc.message}. Retrying in {wait_time:.2f}s...")
                    time.sleep(wait_time)
                    delay *= 3
                else:
                    raise exc
                    
            except RequestException as exc:
                # Permanent HTTP errors like 400, 401, 403, 404
                raise BufferAPIError(f"HTTP error: {exc}", is_temporary=False)
                
        raise BufferAPIError("Failed to execute Buffer API call due to excessive retries.", is_temporary=True)

    def get_organizations(self) -> list:
        """Retrieves organizations associated with the Buffer account."""
        query = """
        query GetOrganizations {
          account {
            organizations {
              id
              name
            }
          }
        }
        """
        result = self._execute(query)
        account_data = result.get("data", {}).get("account")
        if not account_data:
            return []
        return account_data.get("organizations", [])

    def get_channels(self, organization_id: str) -> list:
        """Retrieves social channels connected to an organization."""
        query = """
        query GetChannels($orgId: OrganizationId!) {
          channels(input: { organizationId: $orgId }) {
            id
            name
            displayName
            service
            avatar
          }
        }
        """
        result = self._execute(query, {"orgId": organization_id})
        return result.get("data", {}).get("channels", [])

    def get_queued_posts(self, organization_id: str, channel_id: str) -> list:
        """Retrieves currently scheduled posts in the channel queue."""
        query = """
        query GetQueuedPosts($orgId: OrganizationId!, $channelIds: [ChannelId!]!) {
          posts(
            input: {
              organizationId: $orgId
              filter: { channelIds: $channelIds, status: [scheduled] }
            }
          ) {
            edges {
              node {
                id
                text
                dueAt
                status
              }
            }
          }
        }
        """
        result = self._execute(query, {
            "orgId": organization_id,
            "channelIds": [channel_id]
        })
        edges = result.get("data", {}).get("posts", {}).get("edges", [])
        return [edge["node"] for edge in edges if "node" in edge]



    def create_post(self, channel_id: str, text: str, due_at: str, image_url: str, first_comment: str = None) -> dict:
        """Creates a scheduled post on the specified channel."""
        query = """
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            __typename
            ... on PostActionSuccess {
              post {
                id
                dueAt
              }
            }
            ... on MutationError {
              message
            }
          }
        }
        """
        
        # Prepare CreatePostInput input object
        input_data = {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": due_at,
            "assets": [
                {
                    "image": {
                        "url": image_url
                    }
                }
            ]
        }
        
        # Always include metadata.instagram.type = 'post' and shouldShareToFeed = True for Instagram channels
        input_data["metadata"] = {
            "instagram": {
                "type": "post",
                "shouldShareToFeed": True
            }
        }

        
        if first_comment:
            input_data["metadata"]["instagram"]["firstComment"] = first_comment


        result = self._execute(query, {"input": input_data})
        create_data = result.get("data", {}).get("createPost", {})
        
        # Handle Union response type
        typename = create_data.get("__typename")
        if typename == "MutationError" or "message" in create_data:
            err_msg = create_data.get("message", "Unknown mutation error")
            raise BufferAPIError(f"Buffer Mutation Error: {err_msg}", is_temporary=False)
            
        return create_data.get("post", {})
