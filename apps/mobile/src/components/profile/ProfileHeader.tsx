import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  fullName: string;
  avatarUri: string | null;
  bio?: string;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  onRemovePhoto: () => void;
};

export default function ProfileHeader({
  fullName,
  avatarUri,
  bio,
  onTakePhoto,
  onChooseFromGallery,
  onRemovePhoto,
}: Props) {
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);

  const getInitials = (name: string) => {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'FP';
  };

  return (
    <View style={styles.container}>
      {/* Green Header Extension backdrop */}
      <View style={styles.greenBackdrop} />

      {/* Overlapping Avatar Container */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          style={styles.avatarTouchable}
          activeOpacity={0.85}
          onPress={() => setIsPhotoSheetVisible(true)}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{getInitials(fullName)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Camera Badge Button */}
        <TouchableOpacity
          style={styles.cameraBadge}
          activeOpacity={0.8}
          onPress={() => setIsPhotoSheetVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="camera" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* User Info Details */}
      <Text style={styles.nameText} numberOfLines={1}>
        {fullName || 'Pet Parent'}
      </Text>
      <Text style={styles.roleSubtitle}>Pet Parent</Text>
      {Boolean(bio && bio.trim() !== '') && (
        <Text style={styles.bioText} numberOfLines={2}>
          "{bio}"
        </Text>
      )}

      {/* Bottom Sheet Modal for Photo Options */}
      <Modal
        visible={isPhotoSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPhotoSheetVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Profile Photo</Text>

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setIsPhotoSheetVisible(false);
                    onTakePhoto();
                  }}
                >
                  <View style={styles.sheetIconWrapper}>
                    <Ionicons name="camera-outline" size={20} color="#35501F" />
                  </View>
                  <Text style={styles.sheetOptionText}>Take photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setIsPhotoSheetVisible(false);
                    onChooseFromGallery();
                  }}
                >
                  <View style={styles.sheetIconWrapper}>
                    <Ionicons name="images-outline" size={20} color="#35501F" />
                  </View>
                  <Text style={styles.sheetOptionText}>Choose from gallery</Text>
                </TouchableOpacity>

                {Boolean(avatarUri) && (
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => {
                      setIsPhotoSheetVisible(false);
                      onRemovePhoto();
                    }}
                  >
                    <View style={[styles.sheetIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </View>
                    <Text style={[styles.sheetOptionText, { color: '#DC2626' }]}>Remove photo</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.sheetCancelButton}
                  onPress={() => setIsPhotoSheetVisible(false)}
                >
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  greenBackdrop: {
    position: 'absolute',
    top: -20, // extends up behind the fixed header seam
    left: -20,
    right: -20,
    height: 54,
    backgroundColor: '#35501F',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    marginTop: 10,
    position: 'relative',
  },
  avatarTouchable: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#35501F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Catcut',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#35501F',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nameText: {
    fontFamily: 'Catcut',
    fontSize: 22,
    color: '#1F2937',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  roleSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  bioText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: 'Catcut',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    minHeight: 48,
  },
  sheetIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetOptionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#1F2937',
  },
  sheetCancelButton: {
    marginTop: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#4B5563',
  },
});
