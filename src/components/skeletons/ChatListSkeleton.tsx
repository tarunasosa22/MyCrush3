import { View } from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { moderateScale, scale, verticalScale } from '../../utils/Scale';

const ChatListSkeleton = () => {
  return (
    <SkeletonPlaceholder
      borderRadius={8}
      highlightColor="#E0E0E0"
      backgroundColor="#F2F2F2"
      speed={1200}
    >
      <View
        style={{ paddingHorizontal: scale(16), paddingTop: verticalScale(12) }}
      >
        {[...Array(8)].map((_, index) => (
          <SkeletonPlaceholder.Item
            key={index}
            flexDirection="row"
            alignItems="center"
            marginBottom={verticalScale(20)}
          >
            {/* Profile Picture */}
            <SkeletonPlaceholder.Item
              width={scale(55)}
              height={verticalScale(55)}
              borderRadius={moderateScale(99)}
            />

            {/* Name + Last message */}
            <SkeletonPlaceholder.Item marginLeft={scale(12)}>
              {/* Name line */}
              <SkeletonPlaceholder.Item
                width={scale(120)}
                height={verticalScale(16)}
                borderRadius={moderateScale(8)}
              />
              {/* Message line */}
              <SkeletonPlaceholder.Item
                marginTop={verticalScale(6)}
                width={scale(180)}
                height={verticalScale(14)}
                borderRadius={moderateScale(7)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </View>
    </SkeletonPlaceholder>
  );
};

export default ChatListSkeleton;
