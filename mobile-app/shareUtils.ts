import { Share, Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export interface ShareCardHighlight {
  label: string;
  value: string;
}

export type ShareCardTemplate = 'zodiac_alignment' | 'power_window' | 'memory_insight' | 'hope_advice' | 'general';

export interface ShareCardData {
  category: string; // e.g. 'DAILY HOROSCOPE', 'BIRTH CHART', 'TAROT READING', etc.
  title: string; // e.g. 'Scorpio Daily Horoscope', 'The Star Reading'
  subtitle?: string; // e.g. 'August 4, 2026'
  readingText: string; // The core reading insight
  highlights?: ShareCardHighlight[]; // Key bullet points or metrics
  zodiac?: string;
  zodiacIndex?: number;
  zodiacTraits?: string;
  timeWindow?: string;
  eventName?: string;
  templateType?: ShareCardTemplate;
  shareUrl?: string;
}

export const DEFAULT_APP_URL = 'https://astroai4u.com';

/**
 * Format a share card into a visually structured text layout suitable for messaging apps.
 */
export const formatShareCardText = (data: ShareCardData): string => {
  const appUrl = data.shareUrl || DEFAULT_APP_URL;

  let card = `✨ AstroAi4u Cosmic Reading ✨\n`;
  card += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  card += `🔮 [${data.category.toUpperCase()}]\n`;
  card += `🌟 ${data.title}\n`;
  if (data.subtitle) {
    card += `📅 ${data.subtitle}\n`;
  }
  card += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Truncate reading text if extremely long for clean sharing
  let body = data.readingText.trim();
  if (body.length > 350) {
    body = body.substring(0, 347) + '...';
  }
  card += `"${body}"\n\n`;

  if (data.highlights && data.highlights.length > 0) {
    card += `✨ Key Highlights:\n`;
    data.highlights.forEach((h) => {
      card += ` • ${h.label}: ${h.value}\n`;
    });
    card += `\n`;
  }

  card += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  card += `📲 Get your free personalized AI horoscope & reading on AstroAi4u:\n`;
  card += `👉 ${appUrl}\n`;

  return card;
};

/**
 * Trigger native device sharing popup with card text and app link
 */
export const executeNativeShare = async (data: ShareCardData): Promise<boolean> => {
  try {
    const formattedMessage = formatShareCardText(data);
    const result = await Share.share(
      {
        title: `${data.category}: ${data.title}`,
        message: formattedMessage,
        url: data.shareUrl || DEFAULT_APP_URL,
      },
      {
        dialogTitle: `Share ${data.category} Card - AstroAi4u`,
        subject: `My ${data.category} Insight from AstroAi4u`,
      }
    );

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Error sharing card:', error);
    Alert.alert('Share Failed', error?.message || 'Could not trigger native share.');
    return false;
  }
};

/**
 * Share a captured image URI (PNG/JPG) using expo-sharing or native share
 */
export const executeImageShare = async (uri: string, dialogTitle: string = 'Share AstroAi4u Card'): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle,
        UTI: 'public.png',
      });
      return true;
    } else {
      // Fallback for platforms where expo-sharing is unavailable
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `AstroAi4U_Card_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }
      return false;
    }
  } catch (err: any) {
    console.error('Error sharing image card:', err);
    Alert.alert('Share Failed', err?.message || 'Could not export image card.');
    return false;
  }
};
