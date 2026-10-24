import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type AuthScreen = "welcome" | "login" | "signup" | "app";
type Tab = "wallet" | "recipients" | "cards" | "menu" | "ai";

const GOLD = "#ffb52e";
const SURFACE = "#262626";
const MUTED = "#a5a5a5";
const recipients = [
  ["Emily Johnson", "9638934867458", "👩🏻‍🎤"],
  ["Charlotte Anderson", "9638934867458", "👩🏻‍💼"],
  ["Christopher Wilson", "9638934867458", "👨🏽‍🎤"],
  ["Isak Taylor", "9638934867458", "👨🏻‍🎨"],
  ["Ava Brown", "9638934867458", "👩🏽‍🦱"],
  ["Oliver Smith", "9638934867458", "👨🏻‍💻"],
];
const suggestions = [
  "Visualize a dashboard summarizing spending trends for better insights",
  "Show me my last 3 transactions to Pablo Morales",
  "Track spending habits and get personalized budgeting tips",
  "Show me the unpaid bills for this month",
];

function Label({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

function ActionButton({
  children,
  onPress,
  secondary = false,
  compact = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary && styles.secondaryButton,
        compact && styles.compactButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, secondary && styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.headerSide}>
        <Text style={styles.headerIcon}>{onBack ? "‹" : ""}</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={[styles.headerSide, styles.headerRight]}>
        {right ?? <Text style={styles.headerIcon}>{onBack ? "" : "↗"}</Text>}
      </View>
    </View>
  );
}

function Progress({ active, labels }: { active: number; labels: string[] }) {
  return (
    <View style={styles.progress}>
      {labels.map((label, index) => {
        const complete = index < active;
        const current = index === active;
        return (
          <View style={styles.progressItem} key={label}>
            <View style={styles.progressLine}>
              {index > 0 && <View style={[styles.progressConnector, complete && styles.progressConnectorDone]} />}
              <View
                style={[
                  styles.progressDot,
                  complete && styles.progressComplete,
                  current && styles.progressCurrent,
                ]}
              >
                {complete && <Text style={styles.progressCheck}>✓</Text>}
              </View>
              {index < labels.length - 1 && (
                <View style={[styles.progressConnector, index + 1 < active && styles.progressConnectorDone]} />
              )}
            </View>
            <Text style={[styles.progressLabel, complete && styles.goldText]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  secure,
  keyboardType,
  onChangeText,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        keyboardType={keyboardType ?? "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777"
        secureTextEntry={secure}
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}

function Surface({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

function AppContent() {
  const [auth, setAuth] = useState<AuthScreen>("welcome");
  const [tab, setTab] = useState<Tab>("wallet");
  const [signupStep, setSignupStep] = useState(0);
  const [sendStep, setSendStep] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState(2);
  const [selectedCard, setSelectedCard] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const enterWallet = () => {
    setAuth("app");
    setTab("wallet");
    setSendStep(null);
  };
  const startSignup = () => {
    setSignupStep(0);
    setAuth("signup");
  };
  const nextSend = () => setSendStep((step) => (step === null ? null : Math.min(step + 1, 4)));
  const sendMessage = (message = prompt) => {
    if (!message.trim()) return;
    setMessages((current) => [...current, message.trim()]);
    setPrompt("");
  };

  if (auth === "welcome") {
    return (
      <LinearGradient colors={["#fff0a0", "#ffd34a", "#f39a2d", "#d75c1d"]} style={styles.welcome}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Text style={styles.brandSymbol}>♞</Text></View>
          <Text style={styles.brandName}>Aurelia</Text>
          <Text style={styles.tagline}>Believe in the Golden Rule,{"\n"}Gold always Rules.</Text>
          <View style={styles.goldDash} />
        </View>
        <View style={styles.welcomeActions}>
          <Pressable onPress={() => setAuth("login")} style={styles.faceButton}>
            <Text style={styles.faceButtonIcon}>⌗</Text>
          </Pressable>
          <Text style={styles.scanCaption}>Scan my face</Text>
          <ActionButton onPress={() => setAuth("login")}>Login</ActionButton>
          <View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>OR</Text><View style={styles.rule} /></View>
          <ActionButton onPress={startSignup} secondary>Sign up</ActionButton>
        </View>
      </LinearGradient>
    );
  }

  if (auth === "login") {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SafeAreaView style={styles.app} edges={["top", "bottom"]}>
          <StatusBar style="light" />
          <Header title="Login" onBack={() => setAuth("welcome")} />
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.display}>Add your details and login into your account today</Text>
            <View style={styles.goldDash} />
            <Field label="Account number" value="98639234" keyboardType="numeric" />
            <Field label="Password" value="password123456" secure />
            <Pressable style={styles.checkboxRow}><View style={styles.checkbox} /><Text style={styles.body}>Save login info</Text></Pressable>
            <ActionButton onPress={enterWallet}>Login</ActionButton>
            <View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>OR</Text><View style={styles.rule} /></View>
            <ActionButton onPress={startSignup} secondary>Sign up</ActionButton>
            <Pressable onPress={enterWallet} style={styles.scanLogin}>
              <View style={styles.scanTile}><Text style={styles.scanButtonIcon}>⌗</Text></View>
              <Text style={styles.body}>Scan my face</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  if (auth === "signup") {
    return (
      <SafeAreaView style={styles.app} edges={["top", "bottom"]}>
        <StatusBar style="light" />
        <Header
          title="Create an account"
          onBack={() => signupStep ? setSignupStep(signupStep - 1) : setAuth("welcome")}
        />
        <Progress active={signupStep} labels={["Details", "Face scan", "Security"]} />
        <ScrollView style={styles.formPanel} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {signupStep === 0 && <>
            <Text style={styles.display}>Add your details</Text><View style={styles.goldDash} />
            <View style={styles.fieldRow}>
              <View style={styles.fieldFlex}><Field label="First name" value="Ismail" /></View>
              <View style={styles.fieldFlex}><Field label="Last name" value="Mesbah" /></View>
            </View>
            <Field label="Email address" placeholder="you@example.com" keyboardType="email-address" />
            <Field label="Account number" value="98639234" keyboardType="numeric" />
            <Field label="Password" placeholder="Create a password" secure />
            <Field label="Repeat password" placeholder="Repeat your password" secure />
            <Pressable style={styles.checkboxRow}><View style={styles.checkbox} /><Text style={styles.body}>I agree to the <Text style={styles.underlined}>Terms of Service</Text></Text></Pressable>
            <ActionButton onPress={() => setSignupStep(1)}>Next</ActionButton>
          </>}
          {signupStep === 1 && <>
            <Text style={styles.display}>Scan your face</Text><View style={styles.goldDash} />
            <View style={styles.facePreview}><Text style={styles.faceEmoji}>👩🏻</Text></View>
            <View style={styles.instructions}>
              {["Look straight into the camera", "Remove glasses, hats, or masks", "Find good lighting"].map((item) => (
                <Text style={styles.instruction} key={item}><Text style={styles.goldText}>✓</Text>  {item}</Text>
              ))}
            </View>
            <ActionButton onPress={() => setSignupStep(2)}>Next</ActionButton>
          </>}
          {signupStep === 2 && <>
            <Text style={styles.display}>Verify your phone number</Text><View style={styles.goldDash} />
            <View style={styles.phoneTile}><Text style={styles.phoneIcon}>▣</Text></View>
            <View style={styles.otpRow}>{["5", "4", "2", "0", "0", "6"].map((digit, index) => <Text style={styles.otpDigit} key={`${digit}-${index}`}>{digit}</Text>)}</View>
            <ActionButton onPress={() => setSignupStep(3)}>Next</ActionButton>
          </>}
          {signupStep === 3 && <View style={styles.successContent}>
            <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
            <Text style={[styles.display, styles.centerText]}>Your account is set!</Text>
            <Text style={[styles.mutedBody, styles.centerText]}>After a few simple steps, your wallet account is ready to go. Add funds and start using Aurelia.</Text>
            <ActionButton onPress={enterWallet} compact>✓  Got it</ActionButton>
          </View>}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sendStep !== null) {
    const labels = ["Amount", "Recipient", "Method", "Pay"];
    return (
      <SafeAreaView style={styles.app} edges={["top", "bottom"]}>
        <StatusBar style="light" />
        <Header title="Send money" onBack={() => sendStep === 0 ? setSendStep(null) : setSendStep(sendStep - 1)} />
        <Progress active={sendStep === 4 ? 4 : sendStep} labels={labels} />
        <View style={styles.sendPanel}>
          <ScrollView style={styles.sendScroll} contentContainerStyle={styles.sendContent} keyboardShouldPersistTaps="handled">
            {sendStep === 0 && <>
              <Field label="You send" value="$ 1,000" />
              <Surface style={styles.feeCard}>
                <View style={styles.feeRow}><Label>Conversion Fee</Label><Label>$5.00</Label></View>
                <View style={styles.feeRow}><Label>Transfer Fee</Label><Label>2.5%</Label></View>
                <View style={styles.divider} />
                <View style={styles.feeRow}><Label>Amount to transfer</Label><Label>$978.23</Label></View>
              </Surface>
              <Field label="Recipient gets" value="€ 982.73" />
              <Text style={styles.mutedBody}>ⓘ  Transfer will take 5 hours</Text>
            </>}
            {sendStep === 1 && <>
              <TextInput value={search} onChangeText={setSearch} placeholder="⌕  Search recipients" placeholderTextColor={MUTED} style={styles.searchBox} />
              <Surface style={styles.recipientList}>
                {recipients.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())).map(([name, number, avatar], index) => (
                  <Pressable key={name} onPress={() => setSelectedPerson(index)} style={[styles.recipientRow, selectedPerson === index && styles.selectedRow]}>
                    <Text style={styles.avatar}>{avatar}</Text>
                    <View style={styles.personCopy}><Text style={styles.personName}>{name}</Text><Text style={styles.subtle}>{number}</Text></View>
                    <View style={[styles.radio, selectedPerson === index && styles.radioSelected]}>{selectedPerson === index && <Text style={styles.radioCheck}>✓</Text>}</View>
                  </Pressable>
                ))}
              </Surface>
            </>}
            {sendStep === 2 && <>
              <Field label="Total sending" value="$ 1,000" />
              <Label style={styles.sectionLabel}>Select card</Label>
              <Surface style={styles.recipientList}>
                {["$23,480.52", "$7,430.52", "$7,480.52"].map((balance, index) => (
                  <Pressable key={balance} onPress={() => setSelectedCard(index)} style={[styles.paymentRow, selectedCard === index && styles.selectedRow]}>
                    <LinearGradient colors={index === 0 ? ["#55dfbd", "#3385d5"] : index === 1 ? ["#b953e8", "#f04a75"] : ["#ffd365", "#ef721f"]} style={styles.miniCard}><Text>▣</Text></LinearGradient>
                    <View style={styles.personCopy}><Text style={styles.amountText}>{balance}</Text><Text style={styles.subtle}>••••  ••••  ••••  3465</Text></View>
                    <View style={[styles.radio, selectedCard === index && styles.radioSelected]}>{selectedCard === index && <Text style={styles.radioCheck}>✓</Text>}</View>
                  </Pressable>
                ))}
              </Surface>
            </>}
            {sendStep === 3 && <>
              <Label style={styles.summaryLabel}>Amount</Label><Text style={styles.summaryAmount}>€ 982.73</Text>
              <Label style={styles.summaryLabel}>Recipient</Label><View style={styles.summaryPerson}><Text style={styles.avatar}>👩🏻‍🎤</Text><View><Text style={styles.personName}>{recipients[selectedPerson]?.[0] ?? "James Parker"}</Text><Text style={styles.subtle}>recipient@email.com</Text></View></View>
              <Label style={styles.summaryLabel}>Card selected</Label><View style={styles.summaryPerson}><Text style={styles.avatar}>💳</Text><View><Text style={styles.personName}>Junior Card</Text><Text style={styles.subtle}>1204  ****  ****  3756</Text></View></View>
              <Surface style={styles.feeCard}>
                <View style={styles.feeRow}><Label>Conversion Fee</Label><Label>$5.00</Label></View>
                <View style={styles.feeRow}><Label>Transfer Fee</Label><Label>2.5%</Label></View>
                <View style={styles.feeRow}><Label>Amount to transfer</Label><Label>$978.23</Label></View>
              </Surface>
              <View style={styles.totalRow}><Text style={styles.totalText}>Total</Text><Text style={styles.totalText}>€ 982.73</Text></View>
            </>}
            {sendStep === 4 && <View style={styles.successContent}>
              <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
              <Text style={[styles.display, styles.centerText]}>Successful operation!</Text>
              <Text style={[styles.mutedBody, styles.centerText]}>Your transfer is on its way. You can follow its progress in your activity.</Text>
            </View>}
          </ScrollView>
          {sendStep < 4 && <ActionButton onPress={nextSend}>{sendStep === 3 ? "Pay" : "Pay"}</ActionButton>}
          {sendStep === 4 && <ActionButton onPress={() => setSendStep(null)} compact>✓  Got it</ActionButton>}
        </View>
      </SafeAreaView>
    );
  }

  const tabTitle: Record<Tab, string> = {
    wallet: "Wallet",
    recipients: "Recipients",
    cards: "My cards",
    menu: "Menu",
    ai: "AI Chat",
  };
  const goToAI = () => setTab("ai");

  return (
    <SafeAreaView style={styles.app} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <Header
        title={tabTitle[tab]}
        onBack={tab === "ai" ? () => setTab("wallet") : undefined}
        right={tab === "ai" ? null : <Pressable onPress={goToAI}><Text style={styles.headerIcon}>↗</Text></Pressable>}
      />
      {tab === "wallet" && <ScrollView contentContainerStyle={styles.dashboard} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#292929", "#232323"]} style={styles.balanceCard}>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Balance</Text><Text style={styles.subtle}>Today, 21 Feb</Text></View><Pressable onPress={() => setSendStep(0)} style={styles.addButton}><Text style={styles.goldText}>＋ Add</Text></Pressable></View>
          <Text style={styles.balanceAmount}>$238,219<Text style={styles.balanceCents}>.32</Text></Text>
          <View style={styles.quickActions}>
            {[["↑", "Send"], ["↓", "Receive"], ["⌗", "Scan"], ["↔", "Convert"]].map(([icon, label]) => (
              <Pressable key={label} onPress={label === "Send" ? () => setSendStep(0) : () => setTab("cards")} style={styles.quickAction}>
                <View style={styles.quickIcon}><Text style={styles.goldText}>{icon}</Text></View><Text style={styles.body}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </LinearGradient>
        <Surface style={styles.expensesCard}>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Expenses</Text><Text style={styles.subtle}>This week, 14 – 21 Feb</Text></View><Text style={styles.period}>▢  This week</Text></View>
          <View style={styles.expenseChart}>
            <View style={styles.statColumn}><View style={styles.stat}><View style={[styles.legendDot, { backgroundColor: "#ffa622" }]} /><Text style={styles.statNumber}>21%</Text><Text style={styles.subtle}>Bills &amp; Debt</Text></View><View style={styles.stat}><View style={[styles.legendDot, { backgroundColor: "#f3e65a" }]} /><Text style={styles.statNumber}>21%</Text><Text style={styles.subtle}>Bills &amp; Debt</Text></View></View>
            <View style={styles.donut}><View style={styles.donutInner}><Text style={styles.subtle}>Expenses</Text><Text style={styles.donutAmount}>$10,262</Text></View></View>
            <View style={styles.statColumn}><View style={styles.stat}><View style={[styles.legendDot, { backgroundColor: "#c56317" }]} /><Text style={styles.statNumber}>21%</Text><Text style={styles.subtle}>Bills &amp; Debt</Text></View><View style={styles.stat}><View style={[styles.legendDot, { backgroundColor: "#b83e16" }]} /><Text style={styles.statNumber}>21%</Text><Text style={styles.subtle}>Shopping</Text></View></View>
          </View>
        </Surface>
        <Surface>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Activity</Text><Text style={styles.subtle}>This week, 14 – 21 Feb</Text></View><Text style={styles.period}>▢  This month</Text></View>
          <View style={styles.chart}><Text style={styles.chartLine}>$25k{"\n"}$10k{"\n"}$5k{"\n"}$1k</Text><View style={styles.chartFill}><Text style={styles.chartSpark}>⌁</Text></View></View>
          <View style={styles.legendRow}><Text style={styles.body}>Earnings{"\n"}<Text style={styles.green}>+23% ↗</Text></Text><Text style={styles.body}>Expenses{"\n"}<Text style={styles.red}>+23% ↙</Text></Text></View>
        </Surface>
        <Surface>
          <View style={styles.rowBetween}><Text style={styles.cardTitle}>My accounts</Text><Pressable onPress={() => setTab("cards")} style={styles.addButton}><Text style={styles.goldText}>＋ Add</Text></Pressable></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountScroll}>
            {["PayPal Account", "PayPal Account", "Savings"].map((name, index) => <Pressable key={`${name}-${index}`} onPress={() => setTab("cards")} style={styles.accountCard}><Text style={styles.bankMark}>♙</Text><Text style={styles.subtle}>{name}</Text><Text style={styles.accountAmount}>$12,724</Text></Pressable>)}
          </ScrollView>
        </Surface>
        <Pressable onPress={goToAI} style={styles.aiTeaser}><View style={styles.aiOrbSmall}><Text style={styles.orbHorse}>♞</Text></View><View style={styles.personCopy}><Text style={styles.body}>Your money, made clearer</Text><Text style={styles.subtle}>Ask Aurelia AI for a personal insight</Text></View><Text style={styles.subtle}>‹</Text></Pressable>
      </ScrollView>}
      {tab === "cards" && <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.cardCarousel}>
          <Pressable onPress={() => setCardIndex((cardIndex + 3) % 4)} style={[styles.sideCard, styles.sideCardLeft]} />
          <LinearGradient colors={["#5016bd", "#7129e2", "#388bf4"]} style={styles.visualCard}>
            <View style={styles.rowBetween}><Text style={styles.cardName}>Junior Card</Text><Text style={styles.mastercard}>🔴🟠</Text></View>
            <View style={styles.cardChip}><Text>▦</Text></View>
            <Text style={styles.cardNumber}>1204  3756  3984  3756</Text>
            <View style={styles.rowBetween}><Text style={styles.cardOwner}>Aurelia Kaizer</Text><Text style={styles.cardOwner}>14/28</Text></View>
          </LinearGradient>
          <Pressable onPress={() => setCardIndex((cardIndex + 1) % 4)} style={[styles.sideCard, styles.sideCardRight]} />
        </View>
        <Text style={styles.dots}>●  ○  ○  ○</Text>
        <Text style={styles.sectionCaption}>Card amount</Text><Text style={styles.cardBalance}>$31,204<Text style={styles.balanceCents}>.94</Text></Text>
        <Text style={[styles.sectionCaption, styles.transactionHeader]}>Latest transactions</Text>
        {["Electricity", "Electricity", "Electricity"].map((name, index) => <View style={styles.transaction} key={`${name}-${index}`}><View style={styles.transactionIcon}><Text style={styles.green}>↑</Text></View><View style={styles.personCopy}><Text style={styles.body}>{name}</Text><Text style={styles.subtle}>9:53 AM</Text></View><Text style={styles.body}>+4.000</Text></View>)}
        <ActionButton onPress={() => setTab("menu")}>＋  Add new card</ActionButton>
      </ScrollView>}
      {tab === "recipients" && <ScrollView contentContainerStyle={styles.tabContent}>
        {["Asher Allen", "Amelia Archer", "Aaron Adams", "Ava Anderson", "Brandon Cole", ...recipients.map(([name]) => name)].map((name, index) => <View key={`${name}-${index}`} style={styles.transaction}><Text style={styles.avatar}>{recipients[index % recipients.length][2]}</Text><Text style={[styles.body, styles.personCopy]}>{name}</Text><Pressable><Text style={styles.moreButton}>⋮</Text></Pressable></View>)}
        <ActionButton onPress={() => setSendStep(0)}>＋  Add recipient</ActionButton>
      </ScrollView>}
      {tab === "menu" && <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.profileRow}><Text style={styles.avatar}>👩🏼‍💼</Text><View style={styles.personCopy}><Text style={styles.cardTitle}>Aurelia Kaiser</Text><Text style={styles.subtle}>View profile</Text></View><Text style={styles.period}>✎ Edit</Text></View>
        {["Subscriptions", "Recipients", "Payments", "Utilities", "Shopping list", "Support", "FAQs", "Logout"].map((item, index) => <Pressable key={item} style={styles.menuItem} onPress={() => item === "Logout" ? setAuth("welcome") : item === "Recipients" ? setTab("recipients") : item === "Payments" ? setSendStep(0) : setTab("cards")}><Text style={styles.menuGlyph}>{["▣", "♟", "▧", "⌘", "♧", "◉", "ⓘ", "↪"][index]}</Text><Text style={styles.body}>{item}</Text>{index === 0 || index === 4 ? <Text style={styles.menuCount}>{index === 0 ? "2" : "15"}</Text> : null}</Pressable>)}
      </ScrollView>}
      {tab === "ai" && <KeyboardAvoidingView style={styles.aiScreen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={12}>
        <ScrollView contentContainerStyle={styles.aiContent} keyboardShouldPersistTaps="handled">
          {messages.length === 0 ? <>
            <View style={styles.aiGreeting}><View style={styles.aiOrb}><Text style={styles.orbHorse}>♞</Text></View><Text style={[styles.display, styles.centerText]}>Hi, how can I help you today?</Text></View>
            {suggestions.map((item) => <Pressable key={item} onPress={() => sendMessage(item)} style={styles.suggestion}><Text style={[styles.body, styles.personCopy]}>{item}</Text><Text style={styles.subtle}>›</Text></Pressable>)}
          </> : messages.map((message, index) => <View key={`${message}-${index}`} style={styles.messageGroup}><Text style={styles.userMessage}>{message}</Text><Text style={[styles.body, styles.response]}>Here is a helpful overview based on your recent activity. Your spending is on track, and your balance is looking healthy.</Text><Surface><Text style={styles.cardTitle}>My spending trends</Text><View style={styles.chart}><View style={styles.chartFill}><Text style={styles.chartSpark}>⌁</Text></View></View><Text style={styles.subtle}>Your spending has stayed consistent over the past few months.</Text></Surface><Text style={styles.subtle}>Are you satisfied with this answer?　✓ Yes　× No</Text></View>)}
        </ScrollView>
        <View style={styles.chatInput}>
          <Pressable style={styles.micButton}><Text style={styles.subtle}>♩</Text></Pressable>
          <TextInput value={prompt} onChangeText={setPrompt} onSubmitEditing={() => sendMessage()} placeholder="Ask anything" placeholderTextColor={MUTED} style={styles.chatTextInput} returnKeyType="send" />
          <Pressable onPress={() => sendMessage()} style={styles.sendChat}><Text style={styles.sendChatText}>↑</Text></Pressable>
        </View>
      </KeyboardAvoidingView>}
      {tab !== "ai" && <View style={styles.bottomNav}>
        {([["wallet", "▣", "Wallet"], ["recipients", "↔", "Transfers"], ["send", "＋", "Send"], ["cards", "▤", "Cards"], ["menu", "☰", "Menu"]] as const).map(([destination, icon, label]) => (
          <Pressable key={destination} accessibilityRole="button" accessibilityLabel={label} onPress={() => destination === "send" ? setSendStep(0) : setTab(destination)} style={styles.navButton}>
            {destination === "send" ? <LinearGradient colors={["#ffe77a", "#ffb52e", "#e87418"]} style={styles.navSend}><Text style={styles.navSendText}>{icon}</Text></LinearGradient> : <Text style={[styles.navIcon, tab === destination && styles.goldText]}>{icon}</Text>}
          </Pressable>
        ))}
      </View>}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  app: { flex: 1, backgroundColor: "#111" },
  welcome: { flex: 1, justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 68, paddingBottom: 36 },
  brand: { alignItems: "center", paddingTop: 36 },
  brandMark: { width: 116, height: 116, borderRadius: 58, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 12 },
  brandSymbol: { color: "#ed9223", fontSize: 62 },
  brandName: { color: "#fff", fontFamily: "Georgia", fontSize: 50, marginTop: 16 },
  tagline: { color: "#fff", fontFamily: "Georgia", fontSize: 21, lineHeight: 31, textAlign: "center", marginTop: 8 },
  goldDash: { width: 24, height: 3, backgroundColor: GOLD, marginTop: 15, marginBottom: 32 },
  welcomeActions: { alignItems: "center", gap: 10 },
  faceButton: { width: 64, height: 64, borderRadius: 20, borderWidth: 1, borderColor: "#ffffffaa", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff10" },
  faceButtonIcon: { fontSize: 32, color: "#fff" },
  scanCaption: { color: "#fff", fontSize: 14 },
  actionButton: { minHeight: 44, width: "100%", backgroundColor: GOLD, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  actionText: { color: "#17120b", fontSize: 15, fontWeight: "600" },
  secondaryButton: { borderWidth: 1, borderColor: "#777", backgroundColor: "transparent" },
  secondaryText: { color: "#fff" },
  compactButton: { width: "auto", alignSelf: "center", minWidth: 96 },
  pressed: { opacity: 0.78 },
  orRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 12, marginVertical: 7 },
  rule: { flex: 1, height: 1, backgroundColor: "#686868" },
  orText: { color: MUTED, fontSize: 12 },
  header: { minHeight: 60, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerSide: { width: 42, height: 40, justifyContent: "center" },
  headerRight: { alignItems: "flex-end" },
  headerIcon: { color: "#fff", fontSize: 29, lineHeight: 34 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "500" },
  authContent: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 34 },
  display: { color: "#f7f5f1", fontFamily: "Georgia", fontSize: 30, lineHeight: 39 },
  field: { minWidth: 0, marginBottom: 23, paddingHorizontal: 4, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#686868" },
  fieldLabel: { color: MUTED, fontSize: 13, marginBottom: 3 },
  fieldInput: { color: "#f8f8f8", fontSize: 15, minHeight: 22, padding: 0 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 9, marginHorizontal: 4, marginTop: 8, marginBottom: 24 },
  checkbox: { width: 17, height: 17, borderRadius: 4, borderWidth: 1, borderColor: "#777" },
  body: { color: "#f5f5f5", fontSize: 14 },
  underlined: { textDecorationLine: "underline" },
  scanLogin: { alignItems: "center", gap: 12, marginTop: 42 },
  scanTile: { width: 60, height: 60, borderRadius: 18, borderColor: "#555", borderWidth: 1, backgroundColor: "#333", alignItems: "center", justifyContent: "center" },
  scanButtonIcon: { color: "#fff", fontSize: 30 },
  progress: { flexDirection: "row", paddingHorizontal: 25, paddingTop: 5, paddingBottom: 18 },
  progressItem: { flex: 1, alignItems: "center" },
  progressLine: { flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center" },
  progressDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#666", backgroundColor: "#111", alignItems: "center", justifyContent: "center", zIndex: 1 },
  progressComplete: { backgroundColor: GOLD, borderColor: GOLD },
  progressCurrent: { backgroundColor: "#777", borderColor: "#777" },
  progressCheck: { color: "#17120b", fontSize: 13, fontWeight: "700" },
  progressConnector: { height: 1, backgroundColor: "#626262", flex: 1, marginHorizontal: -1 },
  progressConnectorDone: { backgroundColor: GOLD },
  progressLabel: { color: MUTED, fontSize: 12, marginTop: 8 },
  goldText: { color: GOLD },
  formPanel: { flex: 1, borderWidth: 1, borderBottomWidth: 0, borderColor: "#4b4b4b", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#171717" },
  formContent: { paddingHorizontal: 19, paddingTop: 20, paddingBottom: 32, flexGrow: 1 },
  fieldRow: { flexDirection: "row", gap: 18 },
  fieldFlex: { flex: 1 },
  facePreview: { width: 250, height: 250, borderRadius: 125, alignSelf: "center", marginTop: 12, marginBottom: 28, borderWidth: 2, borderStyle: "dashed", borderColor: "#777", alignItems: "center", justifyContent: "center", backgroundColor: "#302b26" },
  faceEmoji: { fontSize: 125 },
  instructions: { gap: 11, marginBottom: 52 },
  instruction: { color: "#f1f1f1", fontSize: 14 },
  phoneTile: { alignSelf: "center", width: 118, height: 118, borderRadius: 30, backgroundColor: "#333", borderWidth: 1, borderColor: "#464646", alignItems: "center", justifyContent: "center", marginTop: 46, marginBottom: 64 },
  phoneIcon: { color: "#ddd", fontSize: 48 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginHorizontal: 8, marginBottom: 40 },
  otpDigit: { flex: 1, color: "#fff", textAlign: "center", fontSize: 30, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#747474" },
  successContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  successIcon: { width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: GOLD, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successCheck: { color: GOLD, fontSize: 38 },
  centerText: { textAlign: "center" },
  mutedBody: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 24 },
  sendPanel: { flex: 1, borderWidth: 1, borderBottomWidth: 0, borderColor: "#4b4b4b", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 19, paddingTop: 24, paddingBottom: 16, backgroundColor: "#171717" },
  sendScroll: { flex: 1 },
  sendContent: { flexGrow: 1, paddingBottom: 16 },
  surface: { backgroundColor: SURFACE, borderWidth: 1, borderColor: "#3c3c3c", borderRadius: 22, padding: 18, marginBottom: 15 },
  label: { color: MUTED, fontSize: 12 },
  feeCard: { paddingVertical: 10, marginTop: -1, marginBottom: 20, borderRadius: 15 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  divider: { height: 1, backgroundColor: "#494949", marginVertical: 8 },
  mutedBodyInline: { color: MUTED },
  searchBox: { minHeight: 50, borderWidth: 1, borderColor: "#444", borderRadius: 14, backgroundColor: SURFACE, color: "#fff", paddingHorizontal: 14, marginBottom: 0 },
  recipientList: { padding: 7, marginBottom: 0 },
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 9, minHeight: 67 },
  selectedRow: { borderWidth: 1, borderColor: "#555", backgroundColor: "#353535" },
  avatar: { width: 48, height: 48, overflow: "hidden", textAlign: "center", textAlignVertical: "center", borderRadius: 13, backgroundColor: "#384f87", fontSize: 25 },
  personCopy: { flex: 1 },
  personName: { color: "#fff", fontSize: 15 },
  subtle: { color: "#999", fontSize: 12, marginTop: 4 },
  radio: { width: 18, height: 18, borderWidth: 1, borderColor: "#888", borderRadius: 5, alignItems: "center", justifyContent: "center" },
  radioSelected: { backgroundColor: GOLD, borderColor: GOLD },
  radioCheck: { color: "#17120b", fontSize: 12, fontWeight: "700" },
  sectionLabel: { marginBottom: 10 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 9, minHeight: 78 },
  miniCard: { width: 80, height: 54, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  amountText: { color: "#fff", fontSize: 19 },
  summaryLabel: { borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 8, marginBottom: 8 },
  summaryAmount: { color: "#fff", fontSize: 24, marginBottom: 20 },
  summaryPerson: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 18 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#444", paddingTop: 12, flexDirection: "row", justifyContent: "space-between" },
  totalText: { color: "#fff", fontSize: 20 },
  dashboard: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 130 },
  balanceCard: { borderRadius: 24, borderWidth: 1, borderColor: "#3c3c3c", padding: 20, marginBottom: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { color: "#fff", fontSize: 15 },
  addButton: { borderColor: GOLD, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  balanceAmount: { color: "#fff", fontSize: 43, letterSpacing: -2, marginVertical: 17 },
  balanceCents: { color: "#777" },
  quickActions: { flexDirection: "row", justifyContent: "space-around" },
  quickAction: { alignItems: "center", gap: 7 },
  quickIcon: { width: 42, height: 42, borderRadius: 13, borderWidth: 2, borderColor: GOLD, alignItems: "center", justifyContent: "center" },
  expensesCard: { minHeight: 304 },
  period: { color: "#fff", fontSize: 12, borderWidth: 1, borderColor: "#555", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  expenseChart: { height: 210, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 },
  statColumn: { height: 190, justifyContent: "space-between", width: 78 },
  stat: { alignItems: "center" },
  legendDot: { width: 20, height: 20, borderRadius: 7, marginBottom: 5 },
  statNumber: { color: "#fff", fontSize: 16, fontWeight: "700" },
  donut: { width: 158, height: 158, borderRadius: 79, borderWidth: 18, borderColor: "#dd9c24", borderTopColor: "#a9461e", borderRightColor: "#b83e16", borderBottomColor: "#f6eb68", alignItems: "center", justifyContent: "center" },
  donutInner: { alignItems: "center" },
  donutAmount: { color: "#fff", fontSize: 13, fontWeight: "600", marginTop: 4 },
  chart: { height: 142, marginTop: 18, flexDirection: "row", borderBottomWidth: 1, borderColor: "#3d3d3d", overflow: "hidden" },
  chartLine: { color: "#777", fontSize: 9, lineHeight: 34, width: 34 },
  chartFill: { flex: 1, backgroundColor: "#ffb52e30", justifyContent: "center" },
  chartSpark: { color: GOLD, fontSize: 60, textAlign: "center" },
  legendRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  green: { color: "#42d76a", fontSize: 17 },
  red: { color: "#ff4d4d", fontSize: 17 },
  accountScroll: { gap: 12, paddingTop: 14, paddingRight: 6 },
  accountCard: { width: 122, minHeight: 140, borderWidth: 1, borderColor: "#4c4c4c", borderRadius: 20, backgroundColor: "#303030", padding: 12, justifyContent: "space-between" },
  bankMark: { width: 40, height: 40, borderWidth: 1, borderColor: "#926a23", borderRadius: 20, textAlign: "center", textAlignVertical: "center", color: GOLD, fontSize: 23, backgroundColor: "#4b3b1f" },
  accountAmount: { color: "#fff", fontSize: 18 },
  aiTeaser: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, marginBottom: 15, borderRadius: 18, borderWidth: 1, borderColor: "#383838", backgroundColor: "#222" },
  aiOrbSmall: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: GOLD },
  orbHorse: { color: "#fff", fontSize: 27 },
  bottomNav: { minHeight: 88, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 20, borderTopWidth: 1, borderColor: "#3a3a3a", borderTopLeftRadius: 23, borderTopRightRadius: 23, backgroundColor: "#191919" },
  navButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  navIcon: { color: "#919191", fontSize: 23 },
  navSend: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  navSendText: { color: "#17120b", fontSize: 28 },
  tabContent: { paddingHorizontal: 20, paddingBottom: 28, flexGrow: 1 },
  cardCarousel: { height: 230, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginHorizontal: -20 },
  visualCard: { width: "73%", aspectRatio: 1.56, borderRadius: 24, padding: 20, justifyContent: "space-between", elevation: 8 },
  sideCard: { width: 38, height: 180, borderRadius: 15 },
  sideCardLeft: { backgroundColor: "#233ca5" },
  sideCardRight: { backgroundColor: "#db3b4c" },
  cardName: { color: "#fff", fontWeight: "600" },
  mastercard: { fontSize: 19 },
  cardChip: { width: 35, height: 26, borderRadius: 5, backgroundColor: "#d3ac63", alignItems: "center", justifyContent: "center" },
  cardNumber: { color: "#fff", fontSize: 17, letterSpacing: 1 },
  cardOwner: { color: "#fff", fontSize: 10 },
  dots: { color: "#aaa", textAlign: "center", marginVertical: 12 },
  sectionCaption: { color: MUTED, fontSize: 12, borderBottomWidth: 1, borderColor: "#444", paddingBottom: 10, marginBottom: 12 },
  cardBalance: { color: "#fff", fontSize: 42, marginBottom: 20 },
  transactionHeader: { marginBottom: 0 },
  transaction: { flexDirection: "row", alignItems: "center", gap: 13, minHeight: 72, borderBottomWidth: 1, borderColor: "#333" },
  transactionIcon: { width: 37, height: 37, borderRadius: 12, borderColor: "#24703d", borderWidth: 1, backgroundColor: "#21412a", alignItems: "center", justifyContent: "center" },
  moreButton: { color: MUTED, fontSize: 22, borderWidth: 1, borderColor: "#444", borderRadius: 10, paddingHorizontal: 9 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 64, borderBottomWidth: 1, borderColor: "#3b3b3b" },
  menuGlyph: { width: 25, color: GOLD, fontSize: 20, textAlign: "center" },
  menuCount: { color: GOLD, borderWidth: 1, borderColor: GOLD, borderRadius: 14, padding: 4, marginLeft: "auto" },
  aiScreen: { flex: 1 },
  aiContent: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  aiGreeting: { minHeight: 305, alignItems: "center", justifyContent: "center", gap: 18 },
  aiOrb: { width: 80, height: 80, borderRadius: 40, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", elevation: 14 },
  suggestion: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#404040", borderRadius: 12, backgroundColor: "#222" },
  messageGroup: { gap: 14, paddingTop: 16 },
  userMessage: { alignSelf: "flex-end", maxWidth: "92%", color: "#fff", backgroundColor: "#222", padding: 14, borderWidth: 1, borderColor: "#404040", borderRadius: 14 },
  response: { lineHeight: 21, marginVertical: 6 },
  chatInput: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, padding: 6, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#454545", borderRadius: 16, backgroundColor: "#191919" },
  micButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#444", borderRadius: 12, backgroundColor: "#222" },
  chatTextInput: { flex: 1, minHeight: 36, color: "#fff", fontSize: 13, padding: 0 },
  sendChat: { width: 36, height: 36, borderRadius: 12, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  sendChatText: { color: "#17120b", fontSize: 22 },
});
