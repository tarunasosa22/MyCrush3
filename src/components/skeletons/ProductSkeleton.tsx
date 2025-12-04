import React from 'react';
import { View } from 'react-native';
import useResponsiveTheme from '../../hooks/useResponsiveTheme';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const ProductSkeleton = () => {
  const { f2w, f2h, hp } = useResponsiveTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <SkeletonPlaceholder borderRadius={4} angle={120} speed={1000}>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          height="100%"
        >
          {[...Array(3)].map((_, index) => (
            <SkeletonPlaceholder.Item
              key={index}
              width={f2w(100)}
              height="90%"
              borderRadius={10}
            />
          ))}
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default ProductSkeleton;
