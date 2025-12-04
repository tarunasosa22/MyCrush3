import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useResponsiveTheme from '../../hooks/useResponsiveTheme';
import { scale, verticalScale } from '../../utils/Scale';
import { View } from 'react-native';

const MyAvatarSkeleton = () => {
  const { f2w, f2h } = useResponsiveTheme();

  return (
    <View style={{ flex: 1, paddingHorizontal: scale(10) }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        }}
      >
        {[...Array(6)].map((_, index) => (
          <SkeletonPlaceholder
            key={index}
            borderRadius={8}
            angle={120}
            speed={1000}
            highlightColor="#E0E0E0"
            backgroundColor="#F2F2F2"
          >
            <SkeletonPlaceholder.Item
              width={scale(170)}
              height={verticalScale(240)}
              borderRadius={f2w(20)}
              marginBottom={f2h(12)}
              overflow="hidden"
            >
              {/* Main card background */}
              <SkeletonPlaceholder.Item
                width="100%"
                height={scale(280)}
                borderRadius={f2w(20)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        ))}
      </View>
    </View>
  );
};

export default MyAvatarSkeleton;
