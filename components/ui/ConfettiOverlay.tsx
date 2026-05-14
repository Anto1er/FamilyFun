import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 40;
const COLORS = ['#6C63FF', '#FF6584', '#4CAF50', '#FF9800', '#F44336', '#FFD700', '#00BCD4'];

interface Particle {
  x: number;
  delay: number;
  color: string;
  size: number;
  driftX: number;
}

function ConfettiParticle({ particle, trigger }: { particle: Particle; trigger: boolean }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(particle.x);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      translateY.value = -20;
      translateX.value = particle.x;
      opacity.value = 1;
      rotate.value = 0;

      translateY.value = withDelay(
        particle.delay,
        withTiming(SCREEN_HEIGHT + 50, { duration: 2500, easing: Easing.in(Easing.quad) })
      );
      translateX.value = withDelay(
        particle.delay,
        withTiming(particle.x + particle.driftX, { duration: 2500, easing: Easing.out(Easing.sin) })
      );
      rotate.value = withDelay(
        particle.delay,
        withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 2500 })
      );
      opacity.value = withDelay(
        particle.delay + 1800,
        withTiming(0, { duration: 700 })
      );
    }
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: particle.size, height: particle.size, backgroundColor: particle.color },
        style,
      ]}
    />
  );
}

interface ConfettiOverlayProps {
  visible: boolean;
  onDone?: () => void;
}

export function ConfettiOverlay({ visible, onDone }: ConfettiOverlayProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * SCREEN_WIDTH,
        delay: Math.random() * 600,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        driftX: (Math.random() - 0.5) * 120,
      })),
    []
  );

  useEffect(() => {
    if (visible && onDone) {
      const timer = setTimeout(() => onDone(), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particles.map((p, i) => (
        <ConfettiParticle key={i} particle={p} trigger={visible} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
