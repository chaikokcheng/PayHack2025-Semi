import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const CLAP_IMAGE =
  "https://img.icons8.com/emoji/96/000000/clapping-hands-medium-skin-tone.png";

function ProgressStepper() {
  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  useEffect(() => {
    // Animate line 1 (step 1→2)
    Animated.timing(line1Anim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setStep2Done(true);
      // Animate line 2 (step 2→3)
      Animated.timing(line2Anim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => setStep3Done(true));
    });
  }, []);

  const line1Width = line1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const line2Width = line2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={stepperStyles.row}>
      {/* Step 1 */}
      <View style={stepperStyles.step}>
        <View style={[stepperStyles.circle, { borderColor: Colors.success, backgroundColor: Colors.success }]}> 
          <Ionicons name="checkmark" size={20} color="white" />
        </View>
        <Text style={stepperStyles.stepLabel}>STEP 1</Text>
        <Text style={stepperStyles.title}>Verified Document</Text>
        <Text style={[stepperStyles.status, { color: Colors.success }]}>Completed</Text>
      </View>
      {/* Animated Line 1 */}
      <View style={stepperStyles.lineContainer}>
        <View style={[stepperStyles.line, { backgroundColor: Colors.divider, width: "100%", position: "absolute" }]} />
        <Animated.View style={[
          stepperStyles.line,
          {
            backgroundColor: Colors.primary,
            width: line1Width,
            position: "absolute",
            left: 0,
            top: 0,
          }
        ]} />
      </View>
      {/* Step 2 */}
      <View style={stepperStyles.step}>
        <View style={[
          stepperStyles.circle,
          step2Done
            ? { borderColor: Colors.success, backgroundColor: Colors.success }
            : { borderColor: Colors.primary, backgroundColor: "white" }
        ]}>
          {step2Done
            ? <Ionicons name="checkmark" size={20} color="white" />
            : <View style={[stepperStyles.innerCircle, { borderColor: Colors.primary }]} />}
        </View>
        <Text style={stepperStyles.stepLabel}>STEP 2</Text>
        <Text style={stepperStyles.title}>Submit Application</Text>
        <Text style={[
          stepperStyles.status,
          { color: step2Done ? Colors.success : Colors.primary }
        ]}>
          {step2Done ? "Completed" : "In Progress"}
        </Text>
      </View>
      {/* Animated Line 2 */}
      <View style={stepperStyles.lineContainer}>
        <View style={[stepperStyles.line, { backgroundColor: Colors.divider, width: "100%", position: "absolute" }]} />
        <Animated.View style={[
          stepperStyles.line,
          {
            backgroundColor: Colors.primary,
            width: line2Width,
            position: "absolute",
            left: 0,
            top: 0,
          }
        ]} />
      </View>
      {/* Step 3 */}
      <View style={stepperStyles.step}>
        <View style={[
          stepperStyles.circle,
          step3Done
            ? { borderColor: Colors.success, backgroundColor: Colors.success }
            : { borderColor: Colors.divider, backgroundColor: Colors.divider }
        ]}>
          <Ionicons name="trophy-outline" size={20} color="white" />
        </View>
        <Text style={stepperStyles.stepLabel}>STEP 3</Text>
        <Text style={stepperStyles.title}>Application Success</Text>
        <Text style={[
          stepperStyles.status,
          { color: step3Done ? Colors.success : Colors.textSecondary }
        ]}>
          {step3Done ? "Completed" : "Pending"}
        </Text>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center", // Center vertically
    justifyContent: "center",
    marginBottom: 32,
    paddingTop: 16,
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "white",
  },
  lineContainer: {
    width: 40,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // Center the line vertically between circles
  },
  line: {
    height: 3,
    borderRadius: 2,
    alignSelf: "center",
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
    textAlign: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  note: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
});

function SuccessScreen({ onDashboard }) {
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Congratulations!</Text>
        <Image source={{ uri: CLAP_IMAGE }} style={styles.clapImage} />
        <Text style={styles.subtitle}>
          You’ve completed your onboarding. You’re ready to start your business journey with us!
        </Text>
        <ProgressStepper />
      </View>
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.startBtn} onPress={onDashboard}>
          <Text style={styles.startBtnText}>Start Your Business Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 24,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Inter" : undefined,
  },
  clapImage: {
    width: 120,
    height: 120,
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Inter" : undefined,
  },
  stickyFooter: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  startBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

export default SuccessScreen;
