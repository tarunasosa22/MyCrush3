import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import IMAGES from '../assets/images';
import Fonts from '../utils/fonts';
import useResponsiveTheme from '../hooks/useResponsiveTheme';
import { moderateScale, scale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import { userState } from '../store/userStore';
import { reportIssue, setEventTrackinig } from '../api/user';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { EVENT_NAME } from '../constants';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

interface ReportIssueModalProps {
  currentScreen?: string;
  isVisible: boolean;
  reportItem: {
    id: string | number;
    cover_image: string;
    name: string;
    message?: string;
    type: string;
  };
  // isReelVideo?: boolean;
  // isImageItem?: boolean;
  onCloseModal: () => void;
}

const REPORT_REASONS = [
  'Nudity or Sexual Content',
  'Hate or Discrimination (racism, sexism, religion, etc.)',
  'Self-Harm or Suicide Content',
  'Illegal or Prohibited Content',
  'Copyright or Intellectual Property Violation',
  'Misleading or Scam Content',
  'Other',
];

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CustomReportIssueModal: React.FC<ReportIssueModalProps> = ({
  currentScreen,
  isVisible,
  reportItem,
  // isReelVideo,
  // isImageItem,
  onCloseModal,
}) => {
  const styles = useStyles();
  const [selectedReportReason, setSelectedReportReason] = useState<string>(
    REPORT_REASONS[0],
  );
  const [reportAdditionalDescription, setReportAdditionalDescription] =
    useState<string>('');
  const [reportErrorMessage, setReportErrorMessage] = useState<string>(''); // NEW
  // const user = userStore();
  const theme = useThemeStore().theme;

  const handleReportSubmit = async () => {
    try {
      if (
        selectedReportReason === 'Other' &&
        reportAdditionalDescription.trim() === ''
      ) {
        setReportErrorMessage('Please describe your issue before submitting.');
        return;
      }

      setReportErrorMessage(''); // clear previous errors

      const reportIssueText =
        reportAdditionalDescription.length > 0
          ? reportAdditionalDescription
          : selectedReportReason;

      let reportIssueParams: {
        issue: string;
        message_id?: string;
        message_attachment?: string;
        chat?: string;
        avatar_photo?: string | number;
        avatar?: string | number;
      } = { issue: reportIssueText };
      reportIssueParams.issue = reportIssueText;
      if (reportItem?.type == 'message_id') {
        reportIssueParams.message_id = reportItem?.id?.toString();
      } else if (reportItem?.type == 'message_attachment') {
        reportIssueParams.message_attachment = reportItem?.id?.toString();
      } else if (reportItem?.type == 'chat') {
        reportIssueParams.chat = reportItem?.id?.toString();
      } else if (reportItem?.type == 'avatar_photo') {
        reportIssueParams.avatar_photo = reportItem?.id;
      } else {
        reportIssueParams.avatar = reportItem?.id;
      }
      await reportIssue(reportIssueParams).then(res => {
        console.log('res', res);
      });
      logFirebaseEvent(EVENT_NAME.REPORT_AVATAR, {
        user_id: userState.getState().userData.user?.id,
        avatar_id: reportItem?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.REPORT_AVATAR,
      });
      // ✅ Close modal only after success
      resetAndCloseModal();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleReasonSelect = (reason: string) => {
    if (reason === 'Other') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSelectedReportReason(reason);
  };

  const resetAndCloseModal = () => {
    setSelectedReportReason(REPORT_REASONS[0]);
    setReportAdditionalDescription('');
    onCloseModal();
  };
  console.log('report---->', reportItem);

  const reportItemCoverImage = Array.isArray(reportItem?.cover_image)
    ? reportItem.cover_image[0] // take the first image if array
    : reportItem?.cover_image;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={resetAndCloseModal}
    >
      <View style={styles.reportIssueModalBackdrop}>
        <View style={styles.reportIssueModalWrapper}>
          <View style={styles.reportIssueModalHeader}>
            <Text style={styles.reportIssueModalTitle}>Report</Text>
            <TouchableOpacity onPress={resetAndCloseModal}>
              <Image
                source={IMAGES.close}
                style={styles.reportIssueModalCloseIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* <Image
            source={AppImages.DIVIDER}
            style={styles.reportIssueModalDividerLine}
            resizeMode="contain"
          /> */}
          <View style={styles.reportIssueModalDividerLine} />

          <ScrollView style={styles.reportIssueModalContent}>
            <View style={styles.reportIssueModalItemInfoContainer}>
              {/* {reportItem?.cover_image.length || reportItem?.cover_image ? (
                <Image
                  source={
                    reportItem?.cover_image.length > 0 ||
                    reportItem?.cover_image
                      ? { uri: reportItem?.cover_image }
                      : IMAGES.app_icon
                  }
                  style={styles.reportIssueModalItemImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={IMAGES.app_icon}
                  style={styles.reportIssueModalItemImage}
                  resizeMode="cover"
                />
              )} */}
              <Image
                source={
                  typeof reportItemCoverImage === 'string' &&
                  reportItemCoverImage.trim() !== ''
                    ? { uri: reportItemCoverImage }
                    : IMAGES.app_icon
                }
                style={styles.reportIssueModalItemImage}
                resizeMode="cover"
              />
              {reportItem?.name && (
                <Text style={styles.reportIssueModalItemName}>
                  {reportItem.name}
                </Text>
              )}
              {reportItem?.message && reportItem?.message !== 'image' && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: scale(30),
                    backgroundColor: '#E7E7E7',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    borderBottomLeftRadius: moderateScale(4),
                    marginRight: scale(50),
                  }}
                >
                  <Text style={styles.reportIssueModalChat}>
                    {reportItem.message}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.reportIssueModalSectionHeader}>
              Select reason for Report :
            </Text>

            {REPORT_REASONS.map((reason, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.reportIssueModalReasonRow}
                onPress={() => handleReasonSelect(reason)}
              >
                <View
                  style={[
                    styles.reportIssueModalRadioOuter,
                    selectedReportReason === reason &&
                      styles.reportIssueModalRadioOuterSelected,
                  ]}
                >
                  {selectedReportReason === reason && (
                    <View style={styles.reportIssueModalRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.reportIssueModalReasonText,
                    {
                      color:
                        selectedReportReason === reason
                          ? theme.primaryFriend
                          : theme.heading,
                    },
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            {selectedReportReason === 'Other' && (
              <>
                <Text style={styles.reportIssueModalDescriptionLabel}>
                  Description :
                </Text>
                <TextInput
                  style={[
                    styles.reportIssueModalDescriptionInput,
                    reportErrorMessage ? { borderColor: 'red' } : {},
                  ]}
                  placeholder="Enter here..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  value={reportAdditionalDescription}
                  onChangeText={text => {
                    setReportAdditionalDescription(text);
                    if (text.trim() !== '') setReportErrorMessage('');
                  }}
                />
                {reportErrorMessage ? (
                  <Text style={styles.reportIssueModalErrorText}>
                    {reportErrorMessage}
                  </Text>
                ) : null}
              </>
            )}

            <CommonPrimaryButton
              title="Submit"
              onPress={handleReportSubmit}
              btnStyle={styles.reportIssueModalSubmitButton}
              txtStyle={styles.reportIssueModalSubmitButtonText}
            />

            {/* <View style={{ height: 20 }} /> */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CustomReportIssueModal;

const useStyles = () => {
  const { f2w, f2h, wp, hp } = useResponsiveTheme();
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    reportIssueModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportIssueModalWrapper: {
      width: '90%',
      maxHeight: '90%',
      backgroundColor: theme.white,
      borderRadius: f2w(20),
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: theme.primaryFriend,
    },
    reportIssueModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: f2w(20),
      paddingVertical: f2w(15),
    },
    reportIssueModalTitle: {
      color: theme.primaryFriend,
      fontSize: scale(22),
      fontFamily: Fonts.ISemiBold,
    },
    reportIssueModalCloseButtonWrapper: {
      width: f2h(30),
      height: f2h(30),
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportIssueModalCloseIcon: {
      width: scale(25),
      height: scale(25),
    },
    reportIssueModalDividerLine: {
      height: 1,
      width: '80%',
      alignSelf: 'center',
      backgroundColor: theme.primaryFriend,
    },
    reportIssueModalContent: {
      padding: 20,
    },
    reportIssueModalItemInfoContainer: {
      alignItems: 'center',
      marginBottom: f2h(20),
    },
    reportIssueModalItemImage: {
      width: f2w(65),
      height: f2w(100),
      borderRadius: 15,
      marginBottom: 10,
    },
    reportIssueModalItemName: {
      color: theme.text,
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
    },
    reportIssueModalSectionHeader: {
      color: theme.primaryFriend,
      fontSize: scale(18),
      fontFamily: Fonts.IMedium,
      marginBottom: f2w(10),
    },
    reportIssueModalReasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: f2w(10),
    },
    reportIssueModalRadioOuter: {
      width: f2w(18),
      height: f2w(18),
      borderRadius: f2w(10),
      borderWidth: f2w(1),
      borderColor: '#CCCCCC',
      marginRight: f2w(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportIssueModalRadioOuterSelected: {
      borderColor: theme.primaryFriend,
    },
    reportIssueModalRadioInner: {
      width: f2w(9),
      height: f2w(9),
      borderRadius: 5,
      backgroundColor: theme.primaryFriend,
    },
    reportIssueModalReasonText: {
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
    },
    reportIssueModalDescriptionLabel: {
      color: theme.text,
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      marginTop: 10,
      marginBottom: 10,
    },
    reportIssueModalDescriptionInput: {
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.subText,
      borderRadius: 8,
      padding: 10,
      color: theme.text,
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    reportIssueModalSubmitButton: {
      width: f2w(162),
      height: f2h(50),
      alignSelf: 'center',
      borderRadius: f2w(186) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: hp(2),
    },
    reportIssueModalSubmitButtonText: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      color: theme.white,
    },
    reportIssueModalChat: {
      color: '#374151',
      fontSize: moderateScale(15),
      lineHeight: moderateScale(20),
    },
    reportIssueModalErrorText: {
      color: 'red',
      fontSize: scale(12),
      marginTop: 5,
      fontFamily: Fonts.IRegular,
    },
  });
};
