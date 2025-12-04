import { View } from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useResponsiveTheme from '../../hooks/useResponsiveTheme';
import { scale } from '../../utils/Scale';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';

const CategorySkeleton = () => {
  const { f2w, f2h } = useResponsiveTheme();

  return (
    <SkeletonPlaceholder
      borderRadius={8}
      highlightColor="#E0E0E0"
      backgroundColor="#F2F2F2"
      speed={1200}
    >
      <View style={{ alignItems: 'center' }}>
        <SkeletonPlaceholder.Item
          width={'92%'}
          height={scale(9)}
          borderRadius={scale(5)}
        />
        <View style={{ paddingTop: scale(30), width: '95%' }}>
          {[...Array(5)].map((_, index) => (
            <SkeletonPlaceholder.Item
              key={index}
              flexDirection="row"
              justifyContent="space-around"
              alignItems="center"
              marginBottom={f2h(20)}
            >
              {/* Profile Picture */}
              <SkeletonPlaceholder.Item
                width={SCREEN_WIDTH / 3.7}
                height={scale(120)}
                borderRadius={f2w(5)}
              />
              <SkeletonPlaceholder.Item
                width={SCREEN_WIDTH / 3.7}
                height={scale(120)}
                borderRadius={f2w(5)}
              />
              <SkeletonPlaceholder.Item
                width={SCREEN_WIDTH / 3.7}
                height={scale(120)}
                borderRadius={f2w(5)}
              />
              {/* Name + Last message */}
            </SkeletonPlaceholder.Item>
          ))}
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

export default CategorySkeleton;
