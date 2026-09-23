import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

interface AmountQrCardProps {
  amount: number;
  qrSource: ImageSourcePropType | string;
  merchantName?: string;
  onShowToast: (message: string) => void;
}

export default function AmountQrCard({
  amount,
  qrSource,
  merchantName = 'Balingasag Dog and Cat Clinic',
  onShowToast,
}: AmountQrCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const formattedAmount = `₱${amount.toFixed(2)}`;
  const numericAmount = amount.toFixed(2);

  const handleCopyAmount = async () => {
    try {
      await Clipboard.setStringAsync(numericAmount);
      onShowToast('Amount copied');
    } catch {
      onShowToast('Failed to copy amount');
    }
  };

  const handleSaveQr = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        onShowToast('Allow photo access to save the QR');
        setIsSaving(false);
        return;
      }

      let fileUriToSave: string | null = null;

      if (typeof qrSource === 'number') {
        // Bundled local require() asset
        const asset = Asset.fromModule(qrSource);
        await asset.downloadAsync();
        fileUriToSave = asset.localUri || asset.uri;
      } else if (typeof qrSource === 'string') {
        if (qrSource.startsWith('http://') || qrSource.startsWith('https://')) {
          const filename = `qr_${Date.now()}.jpg`;
          const dest = `${FileSystem.cacheDirectory}${filename}`;
          const downloadRes = await FileSystem.downloadAsync(qrSource, dest);
          fileUriToSave = downloadRes.uri;
        } else if (qrSource.startsWith('data:image')) {
          const filename = `qr_${Date.now()}.png`;
          const dest = `${FileSystem.cacheDirectory}${filename}`;
          const base64Data = qrSource.split(',')[1] || qrSource;
          await FileSystem.writeAsStringAsync(dest, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          fileUriToSave = dest;
        } else {
          fileUriToSave = qrSource;
        }
      }

      if (fileUriToSave) {
        await MediaLibrary.saveToLibraryAsync(fileUriToSave);
        onShowToast('QR saved to your gallery');
      } else {
        onShowToast('Could not find image to save');
      }
    } catch {
      onShowToast('Failed to save QR code');
    } finally {
      setIsSaving(false);
    }
  };

  const imageProp: ImageSourcePropType =
    typeof qrSource === 'string' ? { uri: qrSource } : qrSource;

  return (
    <View style={styles.card}>
      {/* Amount Due Header */}
      <Text style={styles.amountLabel}>Amount due</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amountValue}>{formattedAmount}</Text>
        <TouchableOpacity
          onPress={handleCopyAmount}
          style={styles.copyBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Copy amount"
        >
          <Ionicons name="copy-outline" size={16} color="#3B6D11" />
        </TouchableOpacity>
      </View>

      {/* QR Image Box */}
      <View style={styles.qrWrapper}>
        {imageError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
            <Text style={styles.errorText}>Couldn't load the QR code</Text>
            <TouchableOpacity
              onPress={() => {
                setImageError(false);
                setImageLoading(true);
                setReloadKey(prev => prev + 1);
              }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {imageLoading && (
              <View style={styles.spinnerPlaceholder}>
                <ActivityIndicator size="small" color="#35501F" />
              </View>
            )}
            <Image
              key={reloadKey}
              source={imageProp}
              style={styles.qrImage}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        )}
      </View>

      {/* Pay to Merchant */}
      <Text style={styles.merchantText}>Pay to {merchantName}</Text>

      {/* Save QR Outlined Button */}
      <TouchableOpacity
        style={styles.saveQrBtn}
        onPress={handleSaveQr}
        disabled={isSaving || imageError}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Save QR to gallery"
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#35501F" style={{ marginRight: 6 }} />
        ) : (
          <Ionicons name="download-outline" size={16} color="#35501F" style={{ marginRight: 6 }} />
        )}
        <Text style={styles.saveQrBtnText}>
          {isSaving ? 'Saving...' : 'Save QR to gallery'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  amountValue: {
    fontSize: 26,
    fontFamily: 'Montserrat-Medium',
    color: '#3B6D11',
  },
  copyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    width: 210,
    height: 210,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  spinnerPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    zIndex: 1,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
  },
  merchantText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  saveQrBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#35501F',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 2,
  },
  saveQrBtnText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#35501F',
  },
});
