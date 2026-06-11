// src/screens/courses/CourseDetailScreen.js
// Owner: Kandjimbi Eliakim (221266496) - Lead Developer
// Responsibility: Course details, lesson completion, assessment flow, and course detail fixes

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import Colors from '../../styles/colors';

const CourseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params || {};

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!courseId) {
      Alert.alert('Error', 'No course ID provided');
      navigation.goBack();
      return;
    }
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (!courseDoc.exists()) {
        Alert.alert('Error', 'Course not found');
        navigation.goBack();
        return;
      }

      setCourse({ id: courseDoc.id, ...courseDoc.data() });

      if (currentUser) {
        const progressDoc = await getDoc(
          doc(db, 'users', currentUser.uid, 'progress', courseId)
        );
        
        if (progressDoc.exists()) {
          setUserProgress(progressDoc.data());
        } else {
          setUserProgress({
            completedLessons: [],
            status: 'in-progress',
            startedAt: Timestamp.now(),
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('Error', 'Failed to load course details');
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonIndex) => {
    if (!currentUser) return;

    try {
      const progressRef = doc(db, 'users', currentUser.uid, 'progress', courseId);
      const completedLessons = userProgress?.completedLessons || [];

      if (!completedLessons.includes(lessonIndex)) {
        await updateDoc(progressRef, {
          completedLessons: arrayUnion(lessonIndex),
          lastUpdated: Timestamp.now(),
        });

        setUserProgress((prev) => ({
          ...prev,
          completedLessons: [...completedLessons, lessonIndex],
        }));

        Alert.alert('Lesson Complete!', 'Moving to next lesson...');
        
        if (lessonIndex + 1 < course.lessons.length) {
          setActiveLesson(lessonIndex + 1);
        } else {
          Alert.alert('All Lessons Done!', 'Ready for the final assessment?', [
            { text: 'Later', style: 'cancel' },
            { text: 'Take Assessment', onPress: () => navigation.navigate('Assessment', { courseId }) },
          ]);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  const calculateProgress = () => {
    if (!course?.lessons || !userProgress?.completedLessons) return 0;
    return Math.round((userProgress.completedLessons.length / course.lessons.length) * 100);
  };

  const isLessonCompleted = (index) => userProgress?.completedLessons?.includes(index);
  const isLessonLocked = (index) => index > (userProgress?.completedLessons?.length || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
          <Text style={styles.headerSubtitle}>{course.category || 'Safety Training'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress: {calculateProgress()}%</Text>
            <Text style={styles.status}>{userProgress?.status || 'In Progress'}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.card}>
          <Text style={styles.description}>{course.description}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <Text style={styles.statText}>{course.lessons?.length} Lessons</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.statText}>{course.totalDuration || '2h'}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="shield-outline" size={20} color={Colors.primary} />
              <Text style={styles.statText}>{course.difficulty || 'Standard'}</Text>
            </View>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          {course.lessons?.map((lesson, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.lessonCard,
                activeLesson === index && styles.activeLesson,
                isLessonCompleted(index) && styles.completedLesson,
                isLessonLocked(index) && styles.lockedLesson,
              ]}
              onPress={() => !isLessonLocked(index) && setActiveLesson(index)}
              disabled={isLessonLocked(index)}
            >
              <View style={styles.lessonIcon}>
                {isLessonCompleted(index) ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                ) : isLessonLocked(index) ? (
                  <Ionicons name="lock-closed" size={24} color={Colors.gray} />
                ) : (
                  <Ionicons name="play-circle" size={24} color={Colors.primary} />
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, isLessonLocked(index) && styles.lockedText]}>
                  {index + 1}. {lesson.title}
                </Text>
                <Text style={styles.lessonDuration}>{lesson.duration || '10 min'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Lesson Content */}
        {course.lessons?.[activeLesson] && (
          <View style={styles.card}>
            <Text style={styles.lessonHeader}>
              Lesson {activeLesson + 1}: {course.lessons[activeLesson].title}
            </Text>
            <Text style={styles.lessonContent}>{course.lessons[activeLesson].content}</Text>
            
            {course.lessons[activeLesson].safetyPoints && (
              <View style={styles.safetyBox}>
                <Text style={styles.safetyTitle}>⚠️ Safety Points</Text>
                {course.lessons[activeLesson].safetyPoints.map((point, i) => (
                  <Text key={i} style={styles.safetyPoint}>• {point}</Text>
                ))}
              </View>
            )}

            {!isLessonCompleted(activeLesson) && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => handleLessonComplete(activeLesson)}
              >
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Assessment Button */}
        {userProgress?.completedLessons?.length === course.lessons?.length && (
          <TouchableOpacity
            style={styles.assessmentBtn}
            onPress={() => navigation.navigate('Assessment', { courseId })}
          >
            <Ionicons name="school-outline" size={20} color={Colors.white} />
            <Text style={styles.assessmentBtnText}>Take Final Assessment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.navy,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.gold,
  },

  scroll: {
    flex: 1,
  },

  // Cards
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  // Section
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // Lessons
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  activeLesson: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  completedLesson: {
    borderColor: Colors.success,
  },
  lockedLesson: {
    opacity: 0.5,
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Lesson Content
  lessonHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  lessonContent: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  safetyBox: {
    padding: 14,
    backgroundColor: Colors.safetyBackground,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.safetyAccent,
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.safetyAccent,
    marginBottom: 8,
  },
  safetyPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  // Buttons
  completeBtn: {
    padding: 14,
    backgroundColor: Colors.success,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  assessmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  assessmentBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CourseDetailScreen;
