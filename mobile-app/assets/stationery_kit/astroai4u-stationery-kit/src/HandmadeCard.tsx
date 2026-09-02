import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

type Props = { eyebrow: string; title: string; body: string; footer?: string; dark?: boolean };

export function HandmadeCard({ eyebrow, title, body, footer, dark = false }: Props) {
  const exportRef = React.useRef<View>(null);
  const share = async () => {
    const uri = await captureRef(exportRef, { format: 'png', quality: 1, width: 1080, height: 1350 });
    await Sharing.shareAsync(uri, { mimeType: 'image/png' });
  };
  return <View style={[styles.scene, dark && styles.night]}>
    {dark && <SvgUri uri={require('../assets/starfield.svg')} width="100%" height="100%" style={StyleSheet.absoluteFill}/>} 
    <View ref={exportRef} collapsable={false} style={styles.exportCanvas}>
      <SvgUri uri={require('../assets/torn-paper.svg')} width="100%" height="100%" style={StyleSheet.absoluteFill}/>
      <SvgUri uri={require('../assets/washi-tape.svg')} width={150} height={44} style={styles.tape}/>
      <SvgUri uri={require('../assets/ink-stars.svg')} width={120} height={68} style={styles.stars}/>
      <View style={styles.safeArea}>
        <Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>{footer && <Text style={styles.footer}>{footer}</Text>}
      </View>
    </View>
    <Pressable onPress={share} style={styles.share}><Text style={styles.shareText}>Share card</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({scene:{padding:18,backgroundColor:'#F4F0FF'},night:{backgroundColor:'#0C0915'},exportCanvas:{aspectRatio:4/5,position:'relative'},safeArea:{position:'absolute',left:'11%',right:'11%',top:'18%',bottom:'15%'},tape:{position:'absolute',top:-5,left:'33%',transform:[{rotate:'-4deg'}]},stars:{position:'absolute',right:22,top:48},eyebrow:{fontSize:13,letterSpacing:2,color:'#8B42B2',fontWeight:'700'},title:{fontFamily:'CormorantGaramond_600SemiBold',fontSize:38,lineHeight:42,color:'#291A33',marginTop:12},body:{fontFamily:'Lora_400Regular',fontSize:19,lineHeight:30,color:'#463B4D',marginTop:26},footer:{fontFamily:'Caveat_500Medium',fontSize:23,color:'#6C278C',marginTop:'auto'},share:{alignSelf:'center',backgroundColor:'#6C278C',paddingHorizontal:24,paddingVertical:12,borderRadius:30,marginTop:12},shareText:{color:'#fff',fontWeight:'700'}});
