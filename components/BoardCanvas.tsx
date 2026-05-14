import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Touchable } from '@/components/ui/Touchable';
import { useBoardStore, BoardItemData } from '@/stores/boardStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ItemType = 'emoji' | 'sticker' | 'shape';
type CategoryKey = 'emojis' | 'stickers' | 'shapes';

const EMOJIS = ['⭐', '❤️', '☀️', '🚀', '🌈', '🎉', '🦄', '🎵', '🌸', '🍀', '🐱', '🦋', '🍭', '🎈', '😎', '🏆'];

const STICKER_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'trophy', 'paw', 'flower', 'planet', 'sparkles', 'heart', 'star',
  'diamond', 'flame', 'musical-notes', 'moon', 'sunny', 'fish', 'leaf', 'rose', 'ribbon',
];

const SHAPE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.error, '#FFD700', '#00BCD4'];

function DraggableItem({ item, onDrop, onDelete }: { item: BoardItemData; onDrop: (id: string, x: number, y: number) => void; onDelete: (id: string) => void }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = contextX.value + e.translationX;
      translateY.value = contextY.value + e.translationY;
    })
    .onEnd(() => {
      const finalX = item.startX + translateX.value;
      const finalY = item.startY + translateY.value;
      runOnJS(onDrop)(item.id, finalX, finalY);
      translateX.value = 0;
      translateY.value = 0;
    });

  const longPress = Gesture.LongPress()
    .minDuration(400)
    .onEnd((_e, success) => {
      if (success) runOnJS(onDelete)(item.id);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const renderContent = () => {
    switch (item.type) {
      case 'emoji':
        return <Text style={styles.emojiItem}>{item.value}</Text>;
      case 'sticker':
        return (
          <Ionicons
            name={item.value as keyof typeof Ionicons.glyphMap}
            size={40}
            color={item.color ?? COLORS.primary}
          />
        );
      case 'shape':
        return (
          <View
            style={[
              styles.shapeItem,
              {
                backgroundColor: item.color,
                borderRadius: item.shapeKind === 'circle' ? 25 : 6,
              },
            ]}
          />
        );
    }
  };

  return (
    <GestureDetector gesture={Gesture.Race(longPress, pan)}>
      <Animated.View
        style={[
          styles.draggable,
          { left: item.startX, top: item.startY },
          animatedStyle,
        ]}
      >
        {renderContent()}
      </Animated.View>
    </GestureDetector>
  );
}

interface BoardCanvasProps {
  childId: string;
}

export function BoardCanvas({ childId }: BoardCanvasProps) {
  const { t } = useTranslation();
  const { items, loading, loadBoard, saveBoard } = useBoardStore();
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadBoard(childId);
  }, [childId]);

  const scheduleSave = useCallback((newItems: BoardItemData[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveBoard(childId, newItems);
    }, 500);
  }, [childId, saveBoard]);

  const addItem = useCallback((type: ItemType, value: string, color?: string, shapeKind?: 'circle' | 'square') => {
    const centerX = SCREEN_WIDTH / 2 - 30 + (Math.random() - 0.5) * 80;
    const centerY = 120 + (Math.random() - 0.5) * 80;
    const newItem: BoardItemData = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      value,
      color,
      shapeKind,
      startX: centerX,
      startY: centerY,
    };
    const newItems = [...items, newItem];
    scheduleSave(newItems);
    setActiveCategory(null);
  }, [items, scheduleSave]);

  const handleDrop = useCallback((id: string, x: number, y: number) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, startX: x, startY: y } : item
    );
    scheduleSave(newItems);
  }, [items, scheduleSave]);

  const handleDelete = useCallback((id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    scheduleSave(newItems);
  }, [items, scheduleSave]);

  const toggleCategory = (cat: CategoryKey) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarButtons}>
          <Touchable
            style={[styles.toolBtn, activeCategory === 'emojis' && styles.toolBtnActive]}
            onPress={() => toggleCategory('emojis')}
          >
            <Text style={styles.toolBtnEmoji}>😀</Text>
            <Text style={[styles.toolBtnLabel, activeCategory === 'emojis' && styles.toolBtnLabelActive]}>
              {t('board.emojis')}
            </Text>
          </Touchable>

          <Touchable
            style={[styles.toolBtn, activeCategory === 'stickers' && styles.toolBtnActive]}
            onPress={() => toggleCategory('stickers')}
          >
            <Ionicons name="sparkles" size={18} color={activeCategory === 'stickers' ? '#fff' : COLORS.primary} />
            <Text style={[styles.toolBtnLabel, activeCategory === 'stickers' && styles.toolBtnLabelActive]}>
              {t('board.stickers')}
            </Text>
          </Touchable>

          <Touchable
            style={[styles.toolBtn, activeCategory === 'shapes' && styles.toolBtnActive]}
            onPress={() => toggleCategory('shapes')}
          >
            <View style={styles.shapePreview} />
            <Text style={[styles.toolBtnLabel, activeCategory === 'shapes' && styles.toolBtnLabelActive]}>
              {t('board.shapes')}
            </Text>
          </Touchable>
        </View>
      </View>

      {/* Picker */}
      {activeCategory === 'emojis' && (
        <View style={styles.picker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerContent}>
            {EMOJIS.map((emoji) => (
              <Touchable key={emoji} style={styles.pickerItem} onPress={() => addItem('emoji', emoji)}>
                <Text style={styles.pickerEmoji}>{emoji}</Text>
              </Touchable>
            ))}
          </ScrollView>
        </View>
      )}

      {activeCategory === 'stickers' && (
        <View style={styles.picker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerContent}>
            {STICKER_ICONS.map((icon) => (
              <Touchable
                key={icon}
                style={styles.pickerItem}
                onPress={() => addItem('sticker', icon, SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)])}
              >
                <Ionicons name={icon} size={28} color={COLORS.primary} />
              </Touchable>
            ))}
          </ScrollView>
        </View>
      )}

      {activeCategory === 'shapes' && (
        <View style={styles.picker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerContent}>
            {SHAPE_COLORS.map((color) => (
              <React.Fragment key={color}>
                <Touchable style={styles.pickerItem} onPress={() => addItem('shape', 'circle', color, 'circle')}>
                  <View style={[styles.shapeCirclePreview, { backgroundColor: color }]} />
                </Touchable>
                <Touchable style={styles.pickerItem} onPress={() => addItem('shape', 'square', color, 'square')}>
                  <View style={[styles.shapeSquarePreview, { backgroundColor: color }]} />
                </Touchable>
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Canvas */}
      <View style={styles.canvas}>
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} onDrop={handleDrop} onDelete={handleDelete} />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
  },
  toolBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toolBtnEmoji: {
    fontSize: 18,
  },
  toolBtnLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toolBtnLabelActive: {
    color: '#fff',
  },
  shapePreview: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  picker: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  pickerContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  pickerItem: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEmoji: {
    fontSize: 28,
  },
  shapeCirclePreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  shapeSquarePreview: {
    width: 26,
    height: 26,
    borderRadius: 4,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  draggable: {
    position: 'absolute',
    zIndex: 1,
  },
  emojiItem: {
    fontSize: 40,
  },
  shapeItem: {
    width: 50,
    height: 50,
  },
});
