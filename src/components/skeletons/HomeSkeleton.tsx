import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useResponsiveTheme from '../../hooks/useResponsiveTheme';
import { scale, verticalScale } from '../../utils/Scale';

const HomeSkeleton = () => {
  const { f2w, f2h } = useResponsiveTheme();

  return (
    <SkeletonPlaceholder
      borderRadius={8}
      angle={120}
      speed={1000}
      highlightColor="#E0E0E0"
      backgroundColor="#F2F2F2"
    >
      {[...Array(2)].map((_, index) => (
        <SkeletonPlaceholder.Item
          key={index}
          width={scale(350)}
          height={verticalScale(450)}
          alignSelf="center"
          borderRadius={f2w(20)}
          marginVertical={f2h(12)}
          overflow="hidden"
        >
          {/* Full background block */}
          <SkeletonPlaceholder.Item
            width="100%"
            height="100%"
            borderRadius={f2w(20)}
          />
        </SkeletonPlaceholder.Item>
      ))}
    </SkeletonPlaceholder>
  );
};

export default HomeSkeleton;
