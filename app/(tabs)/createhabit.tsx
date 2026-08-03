import React, { useState, useEffect, useRef } from 'react';
import { useHabitStore } from "@/store/habitStore";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const getLocalDate=()=>{
return new Date().toLocaleDateString("en-CA");
};

// ✅ Import images using require
const Meditating = require('../../assets/images/guru-meditating.png');
const Running = require('../../assets/images/guru-running-new.png');
const WakingUp = require('../../assets/images/guru-waking-up.png');
const EatingonTime = require('../../assets/images/guru-eating.png');
const Studying = require('../../assets/images/guru-studying-new.png');
const Planning = require('../../assets/images/guru-planning-new.png');
const Cleaning = require('../../assets/images/guru-cleaning-new.png');
const DrinkingWater = require('../../assets/images/guru-drinking-water.png');
const Sleeping = require('../../assets/images/guru-sleeping.png');
const Journaling = require('../../assets/images/guru-journaling.png');
const ScreenLimit = require('../../assets/images/guru-screen-limit.png');


const IMAGE_MAP: Record<string, any> = {
  meditating: Meditating,
  running: Running,
  waking_up: WakingUp,
  eating_on_time: EatingonTime,
  studying: Studying,
  planning: Planning,
  cleaning: Cleaning,
  drinking_water: DrinkingWater,
  sleeping: Sleeping,
  journaling: Journaling,
  screen_limit: ScreenLimit,
};

interface HabitCard {
  id?: string;
  label: string;
  description: string;
  image: string;
  gradient: [string, string, string];
  color: string;
  isCustom?: boolean;
}

const defaultHabits: HabitCard[] = [
  {
    label: 'Meditating',
    description: 'Find inner peace through mindful breathing and presence',
    image: "meditating",
    gradient: ['#8B5CF6', '#6D28D9', '#D946EF'],
    color: '#8B5CF6',
  },
  {
    label: 'Running',
    description: 'Build endurance and release endorphins with every stride',
    image: "running",
    gradient: ['#06B6D4', '#3B82F6', '#6366F1'],
    color: '#06B6D4',
  },
  {
    label: 'Waking Up',
    description: 'Rise with the sun and embrace the morning energy',
    image: "waking_up",
    gradient: ['#F59E0B', '#F97316', '#EF4444'],
    color: '#F59E0B',
  },
  {
    label: 'Eating on Time',
    description: 'Nourish your body with mindful, timely meals',
    image: "eating_on_time",
    gradient: ['#10B981', '#059669', '#047857'],
    color: '#10B981',
  },
  {
    label: 'Studying',
    description: 'Expanding knowledge',
    image: "studying",
    gradient: ['#6366F1', '#4F46E5', '#4338CA'],
    color: '#6366F1',
  },
  {
    label: 'Planning',
    description: 'Organizing the day',
    image: "planning",
    gradient: ['#F59E0B', '#D97706', '#B45309'],
    color: '#F59E0B',
  },
  {
    label: 'Cleaning',
    description: 'Tidying the space',
    image: "cleaning",
    gradient: ['#10B981', '#059669', '#047857'],
    color: '#10B981',
  },
  {
    label: 'Drinking Water',
    description: 'Stay hydrated',
    image: "drinking_water",
    gradient: ['#0EA5E9', '#3B82F6', '#2563EB'],
    color: '#0EA5E9',
  },
  {
    label: 'Sleeping',
    description: 'Rest and recover',
    image: "sleeping",
    gradient: ['#8B5CF6', '#6D28D9', '#EC4899'],
    color: '#8B5CF6',
  },
  {
    label: 'Journaling',
    description: 'Reflect and write',
    image: "journaling",
    gradient: ['#F43F5E', '#E11D48', '#BE123C'],
    color: '#F43F5E',
  },
  {
    label: 'Screen Limit',
    description: 'Mindful tech usage',
    image: "screen_limit",
    gradient: ['#6B7280', '#4B5563', '#374151'],
    color: '#6B7280',
  },
];

const colorOptions: {
  gradient: [string, string, string];
  color: string;
}[] = [
  { gradient: ['#8B5CF6', '#6D28D9', '#D946EF'], color: '#8B5CF6' },
  { gradient: ['#06B6D4', '#3B82F6', '#6366F1'], color: '#06B6D4' },
  { gradient: ['#F59E0B', '#F97316', '#EF4444'], color: '#F59E0B' },
  { gradient: ['#10B981', '#059669', '#047857'], color: '#10B981' },
  { gradient: ['#EF4444', '#DC2626', '#B91C1C'], color: '#EF4444' },
  { gradient: ['#6366F1', '#4F46E5', '#4338CA'], color: '#6366F1' },
];

const customHabitImages = [
  { key: "meditating", image: Meditating },
  { key: "running", image: Running },
  { key: "waking_up", image: WakingUp },
  { key: "eating_on_time", image: EatingonTime },
  { key: "studying", image: Studying },
  { key: "planning", image: Planning },
  { key: "cleaning", image: Cleaning },
  { key: "drinking_water", image: DrinkingWater },
  { key: "sleeping", image: Sleeping },
  { key: "journaling", image: Journaling },
  { key: "screen_limit", image: ScreenLimit },
];

const HabitSelector: React.FC = () => {
  const creatingRef = useRef(false);
  const [creating, setCreating] = useState(false);
  const [habits, setHabits] = useState<HabitCard[]>(defaultHabits);
  const [currentIndex, setCurrentIndex] = useState(2);
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [habitTimes, setHabitTimes] = useState<Record<number, Date>>({});
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState(new Date());
  const [newHabit, setNewHabit] = useState<Partial<HabitCard>>({
    label: '',
    description: '',
    image: "",
    gradient: ['#8B5CF6', '#6D28D9', '#D946EF'],
    color: '#8B5CF6',
  });

const {
  habits: storeHabits,
  setHabits: setStoreHabits,
  addHabit,
} = useHabitStore();
 


  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
const pulseAnim = useRef(new Animated.Value(1)).current;
const shineAnim = useRef(new Animated.Value(-250)).current;
  useEffect(() => {
    loadCustomHabits();
    animateEntrance();
  }, []);

  useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration:1800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration:1800,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(shineAnim, {
        toValue: 250,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: -250,
        duration: 0,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration:12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange:[0,-18]
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadCustomHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      return;
    }

    const customHabits: HabitCard[] = data.map((habit: any) => ({
      id: habit.id,
      label: habit.label,
      description: habit.description,
        image: habit.image, 
      gradient: habit.gradient ? habit.gradient.split(' ') as [string, string, string] : ['#8B5CF6', '#6D28D9', '#D946EF'],
      color: habit.color || '#8B5CF6',
      isCustom: true,
    }));

    setHabits([...defaultHabits, ...customHabits]);
  };

  const toggleHabit = (habitIndex: number) => {
    if (selectedHabits.includes(habitIndex)) {
      setSelectedHabits(selectedHabits.filter((i) => i !== habitIndex));
      setHabitTimes(prev => {
  const copy = { ...prev };
  delete copy[habitIndex];
  return copy;
});
   
    } else {
      setSelectedHabits([...selectedHabits, habitIndex]);
      setHabitTimes((prev) => ({
        ...prev,
        [habitIndex]: new Date(),
      }));
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (habits.length + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + habits.length + 1) % (habits.length + 1));
  };

  const isCustomHabitCard = currentIndex === habits.length;
  const active: HabitCard = isCustomHabitCard ? habits[0] : habits[currentIndex];
  // console.log("ACTIVE HABIT =>", active);
  const onTimeChange = (event: any, selectedDate: Date | undefined, habitIndex: number) => {
    setShowTimePicker(null);
    if (selectedDate) {
      setHabitTimes((prev) => ({
        ...prev,
        [habitIndex]: selectedDate,
      }));
    }
  };

  const addCustomHabit = async () => {
    const label = newHabit.label?.trim();
    const description = newHabit.description?.trim();

    if (!label || !description || !newHabit.image) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const exists = habits.some((h) => h.label.toLowerCase() === label.toLowerCase());
    if (exists) {
      Alert.alert('Warning', 'Habit already exists. Choose another name.');
      return;
    }

    const customHabit: HabitCard = {
      label: newHabit.label!,
      description: newHabit.description!,
      image: newHabit.image,
      gradient: newHabit.gradient || ['#8B5CF6', '#6D28D9', '#D946EF'],
      color: newHabit.color || '#8B5CF6',
      isCustom: true,
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    console.log("Custom Habit Image:", customHabit.image);
    const { data, error } = await supabase
      .from('user_habits')
      .insert({
        user_id: user.id,
        label: customHabit.label.trim(),
        description: customHabit.description.trim(),
        image: customHabit.image,
        gradient: customHabit.gradient.join(' '),
        color: customHabit.color,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert Error:', error);
      Alert.alert('Error', error.message);
      return;
    }

    setHabits([...habits, { ...customHabit, id: data.id }]);

    const newHabitIndex = habits.length;

     setCurrentIndex(habits.length);

setSelectedHabits((prev) => [...prev, newHabitIndex]);

setHabitTimes((prev) => ({
  ...prev,
  [newHabitIndex]: new Date(),
}));

    
    setShowAddModal(false);
    setNewHabit({
      label: '',
      description: '',
      image:"",
      gradient: ['#8B5CF6', '#6D28D9', '#D946EF'],
      color: '#8B5CF6',
    });
  };

  const removeCustomHabit = async (habitIndex: number) => {
    const habit = habits[habitIndex];
    if (!habit.isCustom) return;

    Alert.alert(
      'Delete Habit',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('user_habits')
              .delete()
              .eq('id', habit.id);

            if (error) {
              console.error(error);
              Alert.alert('Error', 'Delete failed');
              return;
            }

            const updatedHabits = habits.filter((_, i) => i !== habitIndex);
            setHabits(updatedHabits);
            if (currentIndex >= updatedHabits.length) {
              setCurrentIndex(Math.max(updatedHabits.length - 1, 0));
            }
            setSelectedHabits(selectedHabits.filter((i) => i !== habitIndex));
            setHabitTimes((prev) => {
  const copy = { ...prev };
  delete copy[habitIndex];
  return copy;
});
          },
        },
      ]
    );
  };

  const handleCreateHabits = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const usedTimes = new Set<string>();
      let createdCount = 0;

      const { data: existingHabits } = await supabase
        .from('habits')
        .select('id, name, scheduled_time')
        .eq('user_id', user.id);

      for (const habitIndex of selectedHabits) {
        const habit = habits[habitIndex];
        const selectedTime = dayjs(habitTimes[habitIndex] || new Date()).format('HH:mm');
        const displayTime = dayjs(habitTimes[habitIndex] || new Date()).format('hh:mm A');

        if (usedTimes.has(selectedTime)) {
          Alert.alert('Warning', `${displayTime} is already selected for another habit.`);
          creatingRef.current = false;
          setCreating(false);
          return;
        }

        const sameHabit = existingHabits?.find(
          (h) => h.name.toLowerCase() === habit.label.toLowerCase()
        );
        if (sameHabit) {
          Alert.alert('Warning', `${habit.label} habit already exists.`);
          creatingRef.current = false;
          setCreating(false);
          return;
        }

        const sameTime = existingHabits?.find(
          (h) => h.scheduled_time === selectedTime
        );
        if (sameTime) {
          Alert.alert('Warning', `${displayTime} already has another habit.`);
          creatingRef.current = false;
          setCreating(false);
          return;
        }

        usedTimes.add(selectedTime);

const { data: newHabit, error } = await supabase
  .from("habits")
  .insert({
    user_id: user.id,
    name: habit.label,
    image: habit.image,
    scheduled_time: selectedTime,
  })
  .select(`
    id,
    name,
    image,
    scheduled_time,
    created_at,
    habit_logs (
      id,
      date,
      is_complete,
      completed_time
    )
  `)
  .single();

        if (error) {
          console.error(error);
          continue;
        }
        createdCount++;

const activities = [...storeHabits];

if (newHabit) {

const newActivity = {
  ...newHabit,
  habit_logs: newHabit.habit_logs ?? [],
};

addHabit(newActivity);

const updatedHabits = [newActivity, ...activities];

setStoreHabits(updatedHabits);

await AsyncStorage.setItem(
  "habits",
  JSON.stringify(updatedHabits)
);
}
      }

   

   if (createdCount > 0) {
 

Toast.show({
  type: "success",
  text1: "Habit Created 🎉",
  text2: `${createdCount} habit(s) added successfully`,
});

// Reset page state
setSelectedHabits([]);
setHabitTimes({});
setCurrentIndex(2); // Default card (Waking Up)

// Optional: close modal if open
setShowAddModal(false);

setNewHabit({
  label: "",
  description: "",
  image:"",
  gradient: ["#8B5CF6", "#6D28D9", "#D946EF"],
  color: "#8B5CF6",
});

router.replace({
  pathname: "/tracker",
  params: {
    refresh: Date.now().toString(),
  },
});
}

    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  const renderHabitCard = () => {
    if (isCustomHabitCard) {
      return (
        <TouchableOpacity
          style={styles.customCard}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(217, 70, 239, 0.3)']}
            style={styles.customCardGradient}
          >
            <View style={styles.customCardContent}>
              <View style={styles.customCardCircle}>
                {/* <Ionicons name="add" size={40} color="#8B5CF6" /> */}
                <Ionicons
name="add"
size={14}
color={newHabit.color || active.color}
/>
              </View>
              <Text style={styles.customCardText}>Create Custom</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleHabit(currentIndex)}
        style={styles.habitCard}
      >
        <LinearGradient
          colors={active.gradient as [string, string, string]}
          style={styles.habitCardGradient}
        >
          <Animated.View
            style={[
              styles.habitImageContainer,
              { transform: [{ translateY: floatTranslate }] },
            ]}
          >
            {/* <Image source={active.image} style={styles.habitImage} resizeMode="contain" /> */}
            <>
<View
style={{
position:"absolute",
backgroundColor:active.color,
width:200,
height:200,
borderRadius:100,
opacity:0.25,
}}
/>

<Image
  source={
    typeof active.image === "string"
      ? IMAGE_MAP[active.image]
      : active.image
  }
  style={styles.habitImage}
  resizeMode="contain"
/>

<Animated.View
pointerEvents="none"
style={{
position:"absolute",

width:50,
height:260,

backgroundColor:"rgba(255,255,255,0.12)",

transform:[
{
translateX:shineAnim
},
{
rotate:"25deg"
}
]
}}
/>
</>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <View style={styles.container}>
        <LinearGradient
          colors={[
"#050505",
"#111111",
active.color + "22",
]}
          style={styles.background}
        />

        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Header - Matches your image exactly */}
          <View style={styles.header}>
  <Text style={styles.headerTitle}>
    Choose Habits
  </Text>

  <Text style={styles.headerSubtitle}>
    Transform your life • One habit at a time
  </Text>
</View>

            {/* Habit Card - Centered like your image */}
            <View style={styles.cardWrapper}>

          <Animated.View
style={{
position:"absolute",
width:240,
height:240,
borderRadius:130,
opacity:0.22,
backgroundColor:active.color,

transform:[
{scale:pulseAnim}
]
}}
/>    

<Animated.View
style={{
position:"absolute",
width:290,
height:290,
transform:[
{rotate:rotateInterpolate}
]
}}
>



</Animated.View>
          

<Animated.View
style={{
position:"absolute",
width:260,
height:260,
borderRadius:135,
padding:3,
transform:[
{rotate:rotateInterpolate}
]
}}
>

<LinearGradient
colors={[
  active.color,
  "#ffffff",
  active.color,
  active.color,
]}
style={{
flex:1,
borderRadius:150
}}
>

<View
style={{
flex:1,
margin:3,
borderRadius:150,
backgroundColor:"#0b0b0b"
}}
/>

</LinearGradient>

</Animated.View>

<Animated.View
style={{
position:"absolute",
width:290,
height:290,
borderRadius:170,
borderWidth:1,
borderColor:"rgba(255,255,255,0.08)",
transform:[
{
rotate:rotateInterpolate
}
]
}}
/>

              <View style={styles.cardContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
                  style={styles.cardGradient}
                >
                  {renderHabitCard()}
                </LinearGradient>
              </View>
            </View>

            {/* Habit Info - Clean layout like your image */}
            <View style={styles.habitInfo}>
              <View style={styles.habitInfoRow}>
                <Text style={styles.habitLabel}>
                  {isCustomHabitCard ? 'Custom Habit' : active.label}
                </Text>

                {/* <TouchableOpacity
                  onPress={() => toggleHabit(currentIndex)}
                  style={[
                    styles.toggleButton,
                    selectedHabits.includes(currentIndex) && styles.toggleButtonActive,
                  ]}
                >
                  <Text style={styles.toggleButtonText}>
                    {selectedHabits.includes(currentIndex) ? '✓' : '+'}
                  </Text>
                </TouchableOpacity> */}

                <TouchableOpacity
  onPress={() => {
    if (isCustomHabitCard) {
      setShowAddModal(true);   // ✅ Modal open
    } else {
      toggleHabit(currentIndex); // ✅ Normal habit
    }
  }}
  style={[
    styles.toggleButton,
    !isCustomHabitCard &&
      selectedHabits.includes(currentIndex) &&
      styles.toggleButtonActive,
  ]}
>
  <Text style={styles.toggleButtonText}>
    {isCustomHabitCard
      ? "+"
      : selectedHabits.includes(currentIndex)
      ? "✓"
      : "+"}
  </Text>
</TouchableOpacity>

                {active.isCustom && (
                  <TouchableOpacity
                    onPress={() => removeCustomHabit(currentIndex)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.habitDescription}>
                {isCustomHabitCard ? 'Create your own personalized habit' : active.description}
              </Text>

              {active.isCustom && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>Custom</Text>
                </View>
              )}

              {selectedHabits.includes(currentIndex) && (
                <>
                  <View style={styles.addedBadge}>
                    <View style={styles.addedDot} />
                    <Text style={styles.addedBadgeText}>Added</Text>
                  </View>

                  <TouchableOpacity
                    // onPress={() => setShowTimePicker(currentIndex)}
 onPress={() => {
  if (Platform.OS === "ios") {
    setTempTime(habitTimes[currentIndex] || new Date());
    setShowTimePicker(currentIndex);
  } else {
    DateTimePickerAndroid.open({
      value: habitTimes[currentIndex] || new Date(),
      mode: "time",
      is24Hour: false,
  onChange: (event, date) => {
  if (event.type === "dismissed") return;

  if (date) {
    setHabitTimes(prev => ({
      ...prev,
      [currentIndex]: date,
    }));
  }
},
    });
  }
}}
                    style={styles.timePickerButton}
                  >
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <Text style={styles.timePickerText}>
                      {dayjs(habitTimes[currentIndex] || new Date()).format('hh:mm A')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Navigation - Dots like your image */}
            <View style={styles.navigation}>
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>

              <FlatList
                horizontal
                style={{
  flexGrow: 0,
}}
                data={habits}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => setCurrentIndex(index)}
                    style={styles.dotWrapper}
                  >
                    <View
                      style={[
                        styles.dot,
                        currentIndex === index && styles.dotActive,
                        currentIndex === index && {
                          backgroundColor: item.gradient[0],
                          width: 20,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dotsContainer}
              />

              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                // style={styles.addDotButton}
                style={[
styles.addDotButton,
{
borderColor:newHabit.color || active.color,
backgroundColor:(newHabit.color || active.color) + "22",
}
]}
              >
                <Ionicons name="add" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Progress Section - Exactly like your image */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Habits</Text>
                <Text style={styles.progressCount}>
                  {selectedHabits.length} / {habits.length}
                </Text>
              </View>

              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(selectedHabits.length / habits.length) * 100}%`,
                    },
                  ]}
                />
              </View>

              {selectedHabits.length > 0 ? (
                <TouchableOpacity
                  onPress={handleCreateHabits}
                  disabled={creating || selectedHabits.some((i) => !habitTimes[i])}
                  style={[
                    styles.createButton,
                    (creating || selectedHabits.some((i) => !habitTimes[i])) &&
                      styles.createButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={['#34d399', '#10b981']}
                    style={styles.createButtonGradient}
                  >
                    <Text style={styles.createButtonText}>
                      {creating ? 'Creating Habits...' : 'Create Habits'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#0a0a0a" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <Text style={styles.emptyText}>Select habits to begin your journey</Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Time Picker */}
        {/* {showTimePicker !== null && (
          <DateTimePicker
            value={habitTimes[showTimePicker] || new Date()}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => onTimeChange(event, date, showTimePicker)}
          />
        )} */}

{Platform.OS === "ios" && (
  <Modal
    visible={showTimePicker !== null}
    transparent
    animationType="fade"
  >
  <View style={styles.timeOverlay}>
    <View style={styles.timeModal}>

      <Text style={styles.timeTitle}>
        Select Time
      </Text>

      <DateTimePicker
        value={tempTime}
        mode="time"
        display="spinner"
         themeVariant="dark"
        is24Hour={false}
        onChange={(event, date) => {
          if (date) setTempTime(date);
        }}
      />

      <View style={styles.timeFooter}>

        <TouchableOpacity
          onPress={() => setShowTimePicker(null)}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setHabitTimes(prev => ({
              ...prev,
              [showTimePicker!]: tempTime,
            }));

            setShowTimePicker(null);
          }}
        >
          <Text style={styles.doneText}>
            Done
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  </View>
</Modal>
)}
        {/* Add Custom Habit Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1a1a1a', '#0a0a0a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Custom Habit</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Habit Name"
                    placeholderTextColor="#666"
                    value={newHabit.label}
                    onChangeText={(text) => setNewHabit({ ...newHabit, label: text })}
                  />

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Description"
                    placeholderTextColor="#666"
                    value={newHabit.description}
                    onChangeText={(text) => setNewHabit({ ...newHabit, description: text })}
                  />

                  

                  <Text style={styles.modalLabel}>Choose Image</Text>
                  <View style={styles.imageGrid}>
                    {customHabitImages.slice(0, 8).map((img, i) => (
                   
                      <TouchableOpacity
  key={i}
  onPress={() =>
    setNewHabit({
      ...newHabit,
      image: img.key,
    })
  }
  style={[
    styles.imageOption,
  newHabit.image === img.key && {
  backgroundColor: newHabit.color,
},
newHabit.image === img.key && styles.imageOptionSelected,
  ]}
>
                        <Image source={img.image}  style={styles.imageOptionImage} />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.colorGrid}>
                    {colorOptions.map((color) => (
                      <TouchableOpacity
                        key={color.color}
                        onPress={() =>
                          setNewHabit({
                            ...newHabit,
                            gradient: color.gradient,
                            color: color.color,
                          })
                        }
                        style={[
                          styles.colorOption,
                          { backgroundColor: color.color },
                          newHabit.color === color.color && styles.colorOptionSelected,
                        ]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={addCustomHabit}
                    disabled={!newHabit.label || !newHabit.description || !newHabit.image}
                    style={[
                      styles.addHabitButton,
                      (!newHabit.label || !newHabit.description || !newHabit.image) &&
                        styles.addHabitButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#D946EF']}
                      style={styles.addHabitButtonGradient}
                    >
                      <Text style={styles.addHabitButtonText}>Add Habit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.05,
  },
  orb1: {
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#8B5CF6',
  },
  orb2: {
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    backgroundColor: '#06B6D4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },

headerTitle: {
  fontSize: Platform.OS === 'ios' ? 32 : 28,
  fontWeight: '700',
  color: '#ffffff',
  marginBottom: 4,
  textAlign: 'center',
},
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
 cardWrapper: {
  width: 320,
  height: 300,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  marginBottom: 0,
},
  glowRing: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
    opacity: 0.08,
  },

  cardContainer: {
    width: Math.min(width * 0.62, 260),
    height: Math.min(width * 0.62, 260),
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor:"rgba(255,255,255,0.02)",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.9,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 35,
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCard: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  habitCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  habitImageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitImage: {
    width: '92%',
    height: '92%',
  },
  customCard: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  customCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCardContent: {
    alignItems: 'center',
  },
  customCardCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  customCardText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  habitInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  habitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  habitLabel: {
    fontSize: Platform.OS === 'ios' ? 22 : 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitDescription: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 4,
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginTop: 4,
  },
  customBadgeText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    marginTop: 4,
  },
  addedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  addedBadgeText: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '500',
  },
  timePickerButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  timePickerText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    alignItems: 'center',
    paddingHorizontal: 0,
    gap: 4,
  },
  dotWrapper: {
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    height: 6,
    borderRadius: 3,
  },
  addDotButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  progressContainer: {
    width: '100%',
    maxWidth: 320,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  progressCount: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#34d399',
  },
  createButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    color: '#0a0a0a',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  modalLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  
  },
  imageOptionSelected: {
    borderWidth: 2,
    
  },
  imageOptionImage: {
    width: '100%',
    height: '100%',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
  },
  addHabitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  addHabitButtonDisabled: {
    opacity: 0.5,
  },
  addHabitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addHabitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  timeOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},

timeModal: {
  width: 320,
  backgroundColor: "#1c1c1e",
  borderRadius: 20,
  padding: 20,
},

timeTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "700",
  textAlign: "center",
  marginBottom: 10,
},

timeFooter: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},

cancelText: {
  color: "#999",
  fontSize: 16,
},

doneText: {
  color: "#34d399",
  fontSize: 16,
  fontWeight: "700",
},
});

export default HabitSelector;