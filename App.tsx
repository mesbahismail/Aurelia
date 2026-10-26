import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ScanFace, ScanLine, ChevronLeft, ChevronRight, TrendingUp, Sparkles, Wallet, CreditCard, Menu, Plus, Check, X, Smartphone, Landmark, MoreVertical, Pencil, Mic, Users, Clapperboard, Banknote, UtilityPole, ShoppingBasket, Headset, CircleHelp, LogOut, CalendarDays, ChartNoAxesColumn, ReceiptText, Info, Search, type LucideIcon } from "./components/icons";
import { WHITE, GOLD, GOLD_GRADIENT, GOLD_STOPS, DARK_GRADIENT } from "./components/theme";
import { ExpenseDonut, TrendChart, EXPENSES } from "./components/Charts";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type AuthScreen = "welcome" | "login" | "signup" | "app";
type Tab = "wallet" | "recipients" | "cards" | "menu" | "ai";

const SURFACE = "#262626";
const MUTED = WHITE[64];
const AURELIA_LOGO = require("./assets/aurelia-logo.png");
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

const menuIcons = [Clapperboard, Users, Banknote, UtilityPole, ShoppingBasket, Headset, CircleHelp, LogOut];
function MenuIcon({ index }: { index: number }) {
  const Icon = menuIcons[index];
  return <Icon size={22} color={GOLD} strokeWidth={1.8} />;
}
function SuggestionIcon({ index }: { index: number }) {
  const Icon = [ChartNoAxesColumn, ArrowLeftRight, Banknote, ReceiptText][index];
  return <Icon size={20} color={WHITE[64]} strokeWidth={1.8} />;
}

function Label({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

function ActionButton({
  children,
  onPress,
  secondary = false,
  compact = false,
  white = false,
  icon: Icon,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  compact?: boolean;
  white?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary && styles.secondaryButton,
        white && styles.whiteButton,
        compact && styles.compactButton,
        pressed && styles.pressed,
      ]}
    >
      {!secondary && !white && <LinearGradient colors={GOLD_GRADIENT} locations={GOLD_STOPS} style={StyleSheet.absoluteFill} />}
      {Icon && <Icon size={18} color={secondary ? "#fff" : "#111"} strokeWidth={1.8} />}
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
        {onBack ? <ChevronLeft size={28} color="#fff" strokeWidth={1.8} /> : <Sparkles size={22} color="#fff" strokeWidth={1.8} />}
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={[styles.headerSide, styles.headerRight]}>
        {right !== undefined ? right : !onBack && <TrendingUp size={23} color="#fff" strokeWidth={1.8} />}
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
                {complete && <Check size={16} color="#17120b" strokeWidth={1.6} />}
              </View>
              {index < labels.length - 1 && (
                <View style={[styles.progressConnector, index < active && styles.progressConnectorDone]} />
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
  boxed = false,
  currency,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  onChangeText?: (text: string) => void;
  boxed?: boolean;
  currency?: string;
}) {
  return (
    <View style={[styles.field, boxed && styles.boxedField]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, boxed && styles.boxedInput]}>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        keyboardType={keyboardType ?? "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777"
        secureTextEntry={secure}
        style={[styles.fieldInput, boxed && styles.amountInput]}
        value={value}
      />
      {currency && <Text style={styles.currencyLabel}>{currency}</Text>}
      </View>
    </View>
  );
}

function Surface({ children, style }: { children: React.ReactNode; style?: object }) {
  return <LinearGradient colors={["#282828", "#242424"]} style={[styles.surface, style]}>{children}</LinearGradient>;
}

function AppContent() {
  const { width: viewportWidth } = useWindowDimensions();
  const screenWidth = Math.min(viewportWidth, 440);
  const balanceSize = Math.min(48, (screenWidth - 64) * 0.146);
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
      <LinearGradient colors={["#FFEEAF", "#FFDF4B", "#F2AD3C", "#D36221"]} locations={[0, 0.24, 0.48, 1]} style={styles.flex}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.welcome} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Image source={AURELIA_LOGO} accessibilityLabel="Aurelia logo" style={styles.brandLogo} /></View>
          <Text style={styles.brandName}>Aurelia</Text>
          <Text style={styles.tagline}>Believe in the Golden Rule, Gold{"\n"}always Rules.</Text>
          <View style={[styles.goldDash, styles.welcomeDash]} />
        </View>
        <View style={styles.welcomeActions}>
          <Pressable onPress={() => setAuth("login")} style={styles.faceButton}>
            <ScanFace size={30} color="#fff" strokeWidth={1.8} />
          </Pressable>
          <Text style={styles.scanCaption}>Scan my face</Text>
          <ActionButton white onPress={() => setAuth("login")}>Login</ActionButton>
          <View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>OR</Text><View style={styles.rule} /></View>
          <ActionButton onPress={startSignup} secondary>Sign up</ActionButton>
        </View>
        </ScrollView>
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
              <View style={styles.scanTile}><ScanFace size={30} color="#fff" strokeWidth={1.8} /></View>
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
            <View style={styles.facePreview}><View style={styles.facePreviewInner}><ScanFace size={112} color={WHITE[64]} strokeWidth={1} /></View></View>
            <View style={styles.instructions}>
              {["Look straight into the camera", "Remove glasses, hats, or masks", "Find good lighting"].map((item) => (
                <View style={styles.instructionRow} key={item}><Check size={16} color={GOLD} strokeWidth={1.6} /><Text style={styles.instruction}>{item}</Text></View>
              ))}
            </View>
            <View style={styles.formSpacer} />
            <ActionButton onPress={() => setSignupStep(2)}>Next</ActionButton>
          </>}
          {signupStep === 2 && <>
            <Text style={styles.display}>Verify your phone number</Text><View style={styles.goldDash} />
            <View style={styles.phoneTile}><Smartphone size={58} color={WHITE[64]} strokeWidth={2.5} /></View>
            <View style={styles.otpRow}>{["5", "4", "2", "0", "0", "6"].map((digit, index) => <Text style={styles.otpDigit} key={`${digit}-${index}`}>{digit}</Text>)}</View>
            <View style={styles.formSpacer} />
            <ActionButton onPress={() => setSignupStep(3)}>Next</ActionButton>
          </>}
          {signupStep === 3 && <View style={styles.successContent}>
            <View style={styles.successIcon}><Check size={38} color={GOLD} strokeWidth={1.8} /></View>
            <Text style={[styles.display, styles.centerText]}>Your account is set!</Text>
            <Text style={[styles.mutedBody, styles.centerText]}>After a few simple steps, your wallet account is ready to go. Add funds and start using Aurelia.</Text>
            <ActionButton onPress={enterWallet} compact icon={Check}>Got it</ActionButton>
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
              <Field boxed currency="USD" label="You send" value="$ 1,000" />
              <Surface style={styles.feeCard}>
                <View style={styles.feeRow}><Label>Conversion Fee</Label><Label>$5.00</Label></View>
                <View style={styles.feeRow}><Label>Transfer Fee</Label><Label>2.5%</Label></View>
                <View style={styles.divider} />
                <View style={styles.feeRow}><Label>Amount to transfer</Label><Label>$978.23</Label></View>
              </Surface>
              <Field boxed currency="EUR" label="Recipient gets" value="€ 982.73" />
              <View style={styles.inlineInfo}><Info size={14} color={MUTED} /><Text style={styles.label}>Transfer will take 5 hours</Text></View>
            </>}
            {sendStep === 1 && <>
              <View style={styles.searchContainer}><Search size={17} color={MUTED} /><TextInput value={search} onChangeText={setSearch} placeholder="Search recipients" placeholderTextColor={MUTED} style={styles.searchBox} /></View>
              <Surface style={styles.recipientList}>
                {recipients.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())).map(([name, number, avatar], index) => (
                  <Pressable key={name} onPress={() => setSelectedPerson(index)} style={[styles.recipientRow, selectedPerson === index && styles.selectedRow]}>
                    <Text style={styles.avatar}>{avatar}</Text>
                    <View style={styles.personCopy}><Text style={styles.personName}>{name}</Text><Text style={styles.subtle}>{number}</Text></View>
                    <View style={[styles.radio, selectedPerson === index && styles.radioSelected]}>{selectedPerson === index && <Check size={14} color="#111" strokeWidth={1.7} />}</View>
                  </Pressable>
                ))}
              </Surface>
            </>}
            {sendStep === 2 && <>
              <Field boxed label="Total sending" value="$ 1,000" />
              <Label style={styles.sectionLabel}>Select card</Label>
              <Surface style={styles.recipientList}>
                {["$23,480.52", "$7,430.52", "$7,480.52"].map((balance, index) => (
                  <Pressable key={balance} onPress={() => setSelectedCard(index)} style={[styles.paymentRow, selectedCard === index && styles.selectedRow]}>
                    <LinearGradient colors={index === 0 ? ["#55dfbd", "#3385d5"] : index === 1 ? ["#b953e8", "#f04a75"] : ["#ffd365", "#ef721f"]} style={styles.miniCard}><CreditCard size={22} color="#fff" strokeWidth={1.8} /></LinearGradient>
                    <View style={styles.personCopy}><Text style={styles.amountText}>{balance}</Text><Text style={styles.subtle}>••••  ••••  ••••  3465</Text></View>
                    <View style={[styles.radio, selectedCard === index && styles.radioSelected]}>{selectedCard === index && <Check size={14} color="#111" strokeWidth={1.7} />}</View>
                  </Pressable>
                ))}
              </Surface>
            </>}
            {sendStep === 3 && <>
              <Label style={styles.summaryLabel}>Amount</Label><Text style={styles.summaryAmount}>€ 982.73</Text>
              <Label style={styles.summaryLabel}>Recipient</Label><View style={styles.summaryPerson}><Text style={styles.avatar}>👩🏻‍🎤</Text><View><Text style={styles.personName}>{recipients[selectedPerson]?.[0] ?? "James Parker"}</Text><Text style={styles.subtle}>recipient@email.com</Text></View></View>
              <Label style={styles.summaryLabel}>Card selected</Label><View style={styles.summaryPerson}><LinearGradient colors={["#731ADF", "#34116A"]} style={styles.miniCard}><CreditCard size={28} color="#fff" /></LinearGradient><View><Text style={styles.personName}>Junior Card</Text><Text style={styles.subtle}>1204  ****  ****  3756</Text></View></View>
              <Surface style={styles.feeCard}>
                <View style={styles.feeRow}><Label>Conversion Fee</Label><Label>$5.00</Label></View>
                <View style={styles.feeRow}><Label>Transfer Fee</Label><Label>2.5%</Label></View>
                <View style={styles.feeRow}><Label>Amount to transfer</Label><Label>$978.23</Label></View>
              </Surface>
              <View style={styles.totalRow}><Text style={styles.totalText}>Total</Text><Text style={styles.totalText}>€ 982.73</Text></View>
            </>}
            {sendStep === 4 && <View style={styles.successContent}>
              <View style={styles.successIcon}><Check size={38} color={GOLD} strokeWidth={1.8} /></View>
              <Text style={[styles.display, styles.centerText]}>Successful operation!</Text>
              <Text style={[styles.mutedBody, styles.centerText]}>Your transfer is on its way. You can follow its progress in your activity.</Text>
              <ActionButton onPress={() => setSendStep(null)} compact icon={Check}>Got it</ActionButton>
            </View>}
          </ScrollView>
          {sendStep < 4 && <ActionButton onPress={nextSend}>{sendStep === 3 ? "Pay" : "Pay"}</ActionButton>}
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
        right={tab === "ai" ? null : <Pressable accessibilityLabel="Open AI chat" onPress={goToAI}><TrendingUp size={23} color="#fff" strokeWidth={1.8} /><View style={styles.notificationDot} /></Pressable>}
      />
      {tab === "wallet" && <ScrollView contentContainerStyle={styles.dashboard} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#292929", "#232323"]} style={styles.balanceCard}>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Balance</Text><Text style={styles.subtle}>Today, 21 Feb</Text></View><Pressable onPress={() => setSendStep(0)} style={styles.addButton}><Plus size={14} color={GOLD} /><Text style={styles.goldText}>Add</Text></Pressable></View>
          <Text style={[styles.balanceAmount, { fontSize: balanceSize }]}>$238,219<Text style={styles.balanceCents}>.32</Text></Text>
          <View style={styles.quickActions}>
            {([[ArrowUp, "Send"], [ArrowDown, "Receive"], [ScanLine, "Scan"], [ArrowLeftRight, "Convert"]] as const).map(([Icon, label]) => (
              <Pressable key={label} onPress={label === "Send" ? () => setSendStep(0) : () => setTab("cards")} style={styles.quickAction}>
                <View style={styles.quickIcon}><Icon size={24} color={GOLD} strokeWidth={1.8} /></View><Text style={styles.body}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </LinearGradient>
        <Surface style={styles.expensesCard}>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Expenses</Text><Text style={styles.subtle}>This week, 14 – 21 Feb</Text></View><View style={styles.period}><CalendarDays size={16} color="#fff" /><Text style={styles.periodText}>This week</Text></View></View>
          <View style={styles.expenseChart}>
            <View style={styles.statColumn}>{[EXPENSES[0], EXPENSES[3]].map((item) => <View key={item.label} style={styles.stat}><View style={[styles.legendDot, { backgroundColor: item.color }]} /><Text style={styles.statNumber}>{item.value}%</Text><Text style={styles.chartCaption}>{item.label}</Text></View>)}</View>
            <ExpenseDonut />
            <View style={styles.statColumn}>{[EXPENSES[1], EXPENSES[2]].map((item) => <View key={item.label} style={styles.stat}><View style={[styles.legendDot, { backgroundColor: item.color }]} /><Text style={styles.statNumber}>{item.value}%</Text><Text style={styles.chartCaption}>{item.label}</Text></View>)}</View>
          </View>
        </Surface>
        <Surface>
          <View style={styles.rowBetween}><View><Text style={styles.cardTitle}>Activity</Text><Text style={styles.subtle}>This week, 14 – 21 Feb</Text></View><View style={styles.period}><CalendarDays size={16} color="#fff" /><Text style={styles.periodText}>This month</Text></View></View>
          <TrendChart activity />
          <View style={styles.legendRow}>
            <View style={styles.activityStat}><View><Text style={styles.body}>Earnings</Text><Text style={styles.statNumber}>+23%</Text></View><ArrowUpRight size={25} color="#43E433" strokeWidth={1.5} /></View>
            <View style={[styles.activityStat, styles.activityStatDivider]}><View><Text style={styles.body}>Expenses</Text><Text style={styles.statNumber}>+23%</Text></View><ArrowDownLeft size={25} color="#FF453A" strokeWidth={1.5} /></View>
          </View>
        </Surface>
        <Surface>
          <View style={styles.rowBetween}><Text style={styles.cardTitle}>My accounts</Text><Pressable onPress={() => setTab("cards")} style={styles.addButton}><Plus size={14} color={GOLD} /><Text style={styles.goldText}>Add</Text></Pressable></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountScroll}>
            {["PayPal Account", "PayPal Account", "Savings"].map((name, index) => <Pressable key={`${name}-${index}`} onPress={() => setTab("cards")} style={styles.accountCard}><View style={styles.accountTop}><View style={styles.bankMark}><Landmark size={20} color={GOLD} strokeWidth={1.8} /></View><MoreVertical size={17} color={WHITE[48]} /></View><Text style={styles.subtle}>{name}</Text><Text style={styles.accountAmount}>$12,724</Text></Pressable>)}
          </ScrollView>
        </Surface>
        <Pressable onPress={goToAI} style={styles.aiTeaser}><View style={styles.aiOrbSmall}><Image source={AURELIA_LOGO} accessibilityLabel="Aurelia AI" style={styles.orbLogo} /></View><View style={styles.personCopy}><Text style={styles.body}>Your money, made clearer</Text><Text style={styles.subtle}>Ask Aurelia AI for a personal insight</Text></View><ChevronRight size={18} color={MUTED} /></Pressable>
      </ScrollView>}
      {tab === "cards" && <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.cardCarousel}>
          <Pressable onPress={() => setCardIndex((cardIndex + 3) % 4)} style={[styles.sideCard, styles.sideCardLeft]} />
          <LinearGradient colors={["#26152C", "#5C14D4", "#762CF0", "#78A6FF", "#FFEFF8"]} locations={[0, 0.4, 0.65, 0.82, 1]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.visualCard}>
            <View style={styles.rowBetween}><Text style={styles.cardName}>Junior Card</Text><View style={styles.mastercard}><View style={styles.mastercardRed} /><View style={styles.mastercardOrange} /></View></View>
            <View style={styles.cardChip}><View style={styles.chipHorizontal} /><View style={styles.chipVertical} /></View>
            <Text style={[styles.cardNumber, { fontSize: Math.min(20, (screenWidth - 90) * 0.066) }]}>1204  3756  3984  3756</Text>
            <View style={styles.rowBetween}><Text style={styles.cardOwner}>Aurelia Kaizer</Text><Text style={styles.cardOwner}>14/28</Text></View>
          </LinearGradient>
          <Pressable onPress={() => setCardIndex((cardIndex + 1) % 4)} style={[styles.sideCard, styles.sideCardRight]} />
        </View>
        <View style={styles.pagination}>{[0, 1, 2, 3].map((index) => <View key={index} style={[styles.paginationDot, index === cardIndex && styles.paginationActive]} />)}</View>
        <Text style={styles.sectionCaption}>Card amount</Text><Text style={[styles.cardBalance, { fontSize: balanceSize }]}>$31,204<Text style={styles.balanceCents}>.94</Text></Text>
        <Text style={[styles.sectionCaption, styles.transactionHeader]}>Latest transactions</Text>
        {["Electricity", "Electricity", "Electricity"].map((name, index) => <View style={styles.transaction} key={`${name}-${index}`}><View style={styles.transactionIcon}><ArrowUp size={24} color="#50B754" strokeWidth={1.6} /></View><View style={styles.personCopy}><Text style={styles.body}>{name}</Text><Text style={styles.subtle}>9:53 AM</Text></View><Text style={styles.body}>+4.000</Text></View>)}
        <ActionButton icon={Plus} onPress={() => setTab("menu")}>Add new card</ActionButton>
      </ScrollView>}
      {tab === "recipients" && <ScrollView contentContainerStyle={styles.tabContent}>
        {["Asher Allen", "Amelia Archer", "Aaron Adams", "Ava Anderson", "Brandon Cole", ...recipients.map(([name]) => name)].map((name, index) => <View key={`${name}-${index}`} style={styles.transaction}><Text style={styles.avatar}>{recipients[index % recipients.length][2]}</Text><Text style={[styles.body, styles.personCopy]}>{name}</Text><Pressable accessibilityLabel={`More options for ${name}`} style={styles.moreButton}><MoreVertical size={18} color={MUTED} /></Pressable></View>)}
        <ActionButton icon={Plus} onPress={() => setSendStep(0)}>Add recipient</ActionButton>
      </ScrollView>}
      {tab === "menu" && <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.profileRow}><Text style={styles.avatar}>👩🏼‍💼</Text><View style={styles.personCopy}><Text style={styles.cardTitle}>Aurelia Kaiser</Text><Text style={styles.subtle}>View profile</Text></View><View style={styles.period}><Pencil size={15} color="#fff" /><Text style={styles.periodText}>Edit</Text></View></View>
        {["Subscriptions", "Recipients", "Payments", "Utilities", "Shopping list", "Support", "FAQs", "Logout"].map((item, index) => <Pressable key={item} style={styles.menuItem} onPress={() => item === "Logout" ? setAuth("welcome") : item === "Recipients" ? setTab("recipients") : item === "Payments" ? setSendStep(0) : setTab("cards")}><MenuIcon index={index} /><View style={styles.menuItemCopy}><Text style={styles.body}>{item}</Text>{index === 0 || index === 4 ? <Text style={styles.menuCount}>{index === 0 ? "2" : "15"}</Text> : null}</View></Pressable>)}
      </ScrollView>}
      {tab === "ai" && <KeyboardAvoidingView style={styles.aiScreen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={12}>
        <ScrollView contentContainerStyle={styles.aiContent} keyboardShouldPersistTaps="handled">
          {messages.length === 0 ? <>
            <View style={styles.aiGreeting}><View style={styles.aiOrb}><Image source={AURELIA_LOGO} accessibilityLabel="Aurelia AI" style={styles.orbLogo} /></View><Text style={[styles.display, styles.centerText]}>Hi, how can I help you today?</Text></View>
            {suggestions.map((item, index) => <Pressable key={item} onPress={() => sendMessage(item)} style={styles.suggestion}><SuggestionIcon index={index} /><Text style={[styles.body, styles.personCopy]}>{item}</Text><ChevronRight size={18} color={WHITE[48]} /></Pressable>)}
          </> : messages.map((message, index) => <View key={`${message}-${index}`} style={styles.messageGroup}><Text style={styles.userMessage}>{message}</Text><Text style={[styles.body, styles.response]}>Here is a helpful overview based on your recent activity. Your spending is on track, and your balance is looking healthy.</Text><Surface><Text style={styles.cardTitle}>My spending trends</Text><TrendChart /><Text style={styles.subtle}>Your spending has stayed consistent over the past few months.</Text></Surface><View style={styles.feedback}><Text style={styles.body}>Are you satisfied with this answer?</Text><View style={styles.feedbackOptions}><View style={styles.feedbackOption}><Check size={16} color={MUTED} /><Text style={styles.body}>Yes</Text></View><View style={[styles.feedbackOption, styles.feedbackNo]}><X size={16} color={MUTED} /><Text style={styles.body}>No</Text></View></View></View></View>)}
        </ScrollView>
        <View style={styles.chatInput}>
          <Pressable style={styles.micButton}><Mic size={18} color={MUTED} strokeWidth={1.7} /></Pressable>
          <TextInput value={prompt} onChangeText={setPrompt} onSubmitEditing={() => sendMessage()} placeholder="Ask anything" placeholderTextColor={MUTED} style={styles.chatTextInput} returnKeyType="send" />
          <Pressable accessibilityLabel="Send message" onPress={() => sendMessage()}><LinearGradient colors={GOLD_GRADIENT} locations={GOLD_STOPS} style={styles.sendChat}><ArrowUp size={23} color="#111" strokeWidth={1.7} /></LinearGradient></Pressable>
        </View>
      </KeyboardAvoidingView>}
      {tab !== "ai" && <View style={styles.bottomNav}>
        {([["wallet", Wallet, "Wallet"], ["recipients", ArrowLeftRight, "Transfers"], ["send", Plus, "Send"], ["cards", CreditCard, "Cards"], ["menu", Menu, "Menu"]] as const).map(([destination, Icon, label]) => (
          <Pressable key={destination} accessibilityRole="button" accessibilityLabel={label} onPress={() => destination === "send" ? setSendStep(0) : setTab(destination)} style={styles.navButton}>
            {tab === destination && <View style={styles.navIndicator} />}
            {destination === "send" ? <LinearGradient colors={GOLD_GRADIENT} locations={GOLD_STOPS} style={styles.navSend}><Icon size={25} color="#111" strokeWidth={1.8} /></LinearGradient> : <Icon size={27} color={tab === destination ? GOLD : WHITE[48]} strokeWidth={2} />}
          </Pressable>
        ))}
      </View>}
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif: require("./assets/fonts/InstrumentSerif-Regular.ttf"),
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#191919" }} />;

  return (
    <SafeAreaProvider>
      <View style={styles.canvas}>
        <LinearGradient colors={DARK_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.appFrame}>
          <AppContent />
        </LinearGradient>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  formSpacer: { flex: 1, minHeight: 12 },
  menuItemCopy: { flex: 1, minHeight: 64, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: WHITE[24] },
  inputRow: { flexDirection: "row", alignItems: "center" },
  boxedField: { borderBottomWidth: 0, paddingHorizontal: 0, paddingBottom: 0, marginBottom: 24 },
  boxedInput: { minHeight: 62, paddingHorizontal: 15, marginTop: 5, borderRadius: 16, borderWidth: 1.5, borderColor: WHITE[24], backgroundColor: SURFACE, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 7, shadowOffset: { width: 0, height: 5 } },
  amountInput: { flex: 1, fontSize: 24, minHeight: 36 },
  currencyLabel: { color: "#fff", fontSize: 14, marginLeft: 12 },
  searchContainer: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 16, borderWidth: 1, borderColor: WHITE[12], borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: SURFACE },
  instructionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  facePreviewInner: { width: "90%", aspectRatio: 1, borderRadius: 125, backgroundColor: "#2B2B2B", alignItems: "center", justifyContent: "center" },
  pagination: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 28, marginTop: 8 },
  paginationDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: WHITE[64] },
  paginationActive: { backgroundColor: WHITE[64] },
  canvas: { flex: 1, backgroundColor: "#090909", alignItems: "center" },
  appFrame: { flex: 1, width: "100%", maxWidth: 440, overflow: "hidden" },
  whiteButton: { backgroundColor: "#fff" },
  welcomeDash: { width: 31, height: 5, backgroundColor: WHITE[48], marginBottom: 0, marginTop: 18 },
  inlineInfo: { flexDirection: "row", gap: 8, alignItems: "center", marginVertical: 2 },
  notificationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, alignSelf: "center", marginTop: 6 },
  periodText: { color: "#fff", fontSize: 13 },
  chartCaption: { color: WHITE[64], fontSize: 11, lineHeight: 16, marginTop: 3, textAlign: "center" },
  activityStat: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 16 },
  activityStatDivider: { borderLeftWidth: 1, borderColor: WHITE[12], paddingLeft: 16, paddingRight: 0 },
  accountTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17 },
  navIndicator: { position: "absolute", top: -18, height: 2, width: 40, backgroundColor: GOLD },
  mastercardRed: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#EB001B" },
  mastercardOrange: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFAA00", opacity: 0.92, marginLeft: -9 },
  chipHorizontal: { position: "absolute", width: "100%", height: 11, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#8D753D" },
  chipVertical: { width: 14, height: "100%", borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: "#8D753D", borderRadius: 4 },
  feedback: { gap: 16, marginBottom: 16 },
  feedbackOptions: { alignSelf: "flex-start", flexDirection: "row", borderRadius: 20, borderWidth: 1, borderColor: WHITE[24], overflow: "hidden" },
  feedbackOption: { flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 12, paddingVertical: 8 },
  feedbackNo: { borderLeftWidth: 1, borderColor: WHITE[24] },
  flex: { flex: 1 },
  app: { flex: 1, backgroundColor: "transparent" },
  welcome: { flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 68, paddingBottom: 54 },
  brand: { alignItems: "center", paddingTop: 40 },
  brandMark: { width: 118, height: 118, borderRadius: 59, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#7E4D17", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 14 }, elevation: 12 },
  brandLogo: { width: 80, height: 80 },
  brandName: { color: "#fff", fontFamily: "InstrumentSerif", fontSize: 56, lineHeight: 66, marginTop: 18, textShadowColor: "#75471F66", textShadowRadius: 2, textShadowOffset: { width: 0, height: 2 } },
  tagline: { color: "#fff", fontFamily: "InstrumentSerif", fontSize: 28, lineHeight: 38, textAlign: "center", marginTop: 4, textShadowColor: "#75471F66", textShadowRadius: 2, textShadowOffset: { width: 0, height: 2 } },
  goldDash: { width: 24, height: 4, backgroundColor: GOLD, marginTop: 18, marginBottom: 38 },
  welcomeActions: { alignItems: "center", gap: 12 },
  faceButton: { width: 64, height: 64, borderRadius: 21, borderWidth: 2, borderColor: WHITE[64], alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  scanCaption: { color: "#fff", fontSize: 15, marginBottom: 28 },
  actionButton: { minHeight: 40, width: "100%", backgroundColor: GOLD, borderRadius: 12, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  actionText: { color: "#111", fontSize: 15, fontWeight: "500" },
  secondaryButton: { borderWidth: 1.5, borderColor: WHITE[48], backgroundColor: "transparent", shadowOpacity: 0, elevation: 0 },
  secondaryText: { color: "#fff" },
  compactButton: { width: "auto", alignSelf: "center", minWidth: 96 },
  pressed: { opacity: 0.78 },
  orRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 12, paddingHorizontal: 8, marginVertical: 22 },
  rule: { flex: 1, height: 1, backgroundColor: WHITE[24] },
  orText: { color: WHITE[48], fontSize: 11 },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerSide: { width: 42, height: 40, justifyContent: "center" },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "500" },
  authContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 34 },
  display: { color: "#fff", fontFamily: "InstrumentSerif", fontSize: 32, lineHeight: 40 },
  field: { minWidth: 0, marginBottom: 26, paddingHorizontal: 4, paddingBottom: 9, borderBottomWidth: 1.5, borderBottomColor: WHITE[48] },
  fieldLabel: { color: WHITE[64], fontSize: 13, letterSpacing: 0.25, marginBottom: 5 },
  fieldInput: { flex: 1, color: "#fff", fontSize: 14, minHeight: 22, padding: 0 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 9, marginHorizontal: 4, marginTop: 8, marginBottom: 24 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: WHITE[64] },
  body: { color: "#fff", fontSize: 14, lineHeight: 20 },
  underlined: { textDecorationLine: "underline" },
  scanLogin: { alignItems: "center", gap: 12, marginTop: 48 },
  scanTile: { width: 64, height: 64, borderRadius: 21, borderColor: WHITE[12], borderWidth: 1.5, backgroundColor: "#323232", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
  progress: { flexDirection: "row", paddingHorizontal: 8, paddingTop: 12, paddingBottom: 18 },
  progressItem: { flex: 1, alignItems: "center" },
  progressLine: { flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center" },
  progressDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: WHITE[48], backgroundColor: "#141414", alignItems: "center", justifyContent: "center", zIndex: 1 },
  progressComplete: { backgroundColor: GOLD, borderColor: GOLD },
  progressCurrent: { backgroundColor: "#777671", borderColor: "#777671" },
  progressConnector: { height: 1.5, backgroundColor: WHITE[48], flex: 1, marginHorizontal: -1 },
  progressConnectorDone: { backgroundColor: GOLD },
  progressLabel: { color: WHITE[64], fontSize: 12, marginTop: 10 },
  goldText: { color: GOLD },
  formPanel: { flex: 1, borderWidth: 1, borderTopWidth: 2, borderBottomWidth: 0, borderColor: WHITE[24], borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: "transparent" },
  formContent: { paddingHorizontal: 19, paddingTop: 22, paddingBottom: 32, flexGrow: 1 },
  fieldRow: { flexDirection: "row", gap: 18 },
  fieldFlex: { flex: 1 },
  facePreview: { width: "76%", maxWidth: 260, aspectRatio: 1, borderRadius: 125, alignSelf: "center", marginTop: 12, marginBottom: 28, borderWidth: 2, borderStyle: "dashed", borderColor: GOLD, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  instructions: { gap: 11, marginBottom: 52 },
  instruction: { color: "#f1f1f1", fontSize: 14 },
  phoneTile: { alignSelf: "center", width: 118, height: 118, borderRadius: 34, backgroundColor: "#333", borderWidth: 2, borderColor: WHITE[12], alignItems: "center", justifyContent: "center", marginTop: 56, marginBottom: 72 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginHorizontal: 8, marginBottom: 40 },
  otpDigit: { flex: 1, color: "#fff", textAlign: "center", fontSize: 30, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: WHITE[48] },
  successContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  successIcon: { width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: GOLD, backgroundColor: "rgba(255,173,22,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  centerText: { textAlign: "center" },
  mutedBody: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 24 },
  sendPanel: { flex: 1, borderWidth: 1, borderTopWidth: 2, borderBottomWidth: 0, borderColor: WHITE[24], borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 19, paddingTop: 24, paddingBottom: 24, backgroundColor: "transparent" },
  sendScroll: { flex: 1 },
  sendContent: { flexGrow: 1, paddingBottom: 16 },
  surface: { backgroundColor: SURFACE, borderWidth: 1, borderColor: WHITE[12], borderRadius: 24, padding: 19, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 15, shadowOffset: { width: 0, height: 12 }, elevation: 5 },
  label: { color: MUTED, fontSize: 12 },
  feeCard: { paddingVertical: 10, marginTop: -1, marginBottom: 24, borderRadius: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  divider: { height: 1, backgroundColor: WHITE[24], marginVertical: 8 },
  searchBox: { flex: 1, minHeight: 50, color: "#fff", fontSize: 14, padding: 0 },
  recipientList: { padding: 7, marginBottom: 0 },
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 9, minHeight: 67 },
  selectedRow: { borderWidth: 1, borderColor: WHITE[12], backgroundColor: "rgba(255,255,255,0.08)" },
  avatar: { width: 48, height: 48, overflow: "hidden", textAlign: "center", textAlignVertical: "center", borderRadius: 13, backgroundColor: "#384f87", fontSize: 25 },
  personCopy: { flex: 1 },
  personName: { color: "#fff", fontSize: 16 },
  subtle: { color: WHITE[64], fontSize: 11, lineHeight: 16, marginTop: 4 },
  radio: { width: 18, height: 18, borderWidth: 1, borderColor: WHITE[64], borderRadius: 5, alignItems: "center", justifyContent: "center" },
  radioSelected: { backgroundColor: GOLD, borderColor: GOLD },
  sectionLabel: { marginBottom: 10 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 9, minHeight: 78 },
  miniCard: { width: 80, height: 54, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  amountText: { color: "#fff", fontSize: 19 },
  summaryLabel: { borderBottomWidth: 1, borderBottomColor: WHITE[24], paddingBottom: 8, marginBottom: 8 },
  summaryAmount: { color: "#fff", fontSize: 24, marginBottom: 20 },
  summaryPerson: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 18 },
  totalRow: { borderTopWidth: 1, borderTopColor: WHITE[24], paddingTop: 12, flexDirection: "row", justifyContent: "space-between" },
  totalText: { color: "#fff", fontSize: 20 },
  dashboard: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  balanceCard: { borderRadius: 24, borderWidth: 1, borderColor: WHITE[12], padding: 19, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { color: "#fff", fontSize: 15 },
  addButton: { borderColor: GOLD, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,173,22,0.08)" },
  balanceAmount: { color: "#fff", fontSize: 48, fontWeight: "400", letterSpacing: -1.5, marginTop: 20, marginBottom: 20 },
  balanceCents: { color: WHITE[48] },
  quickActions: { flexDirection: "row", justifyContent: "space-around" },
  quickAction: { alignItems: "center", gap: 10 },
  quickIcon: { width: 42, height: 42, borderRadius: 13, borderWidth: 2, borderColor: GOLD, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,173,22,0.08)" },
  expensesCard: { minHeight: 304 },
  period: { borderWidth: 1.5, borderColor: WHITE[24], borderRadius: 12, paddingVertical: 5, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  expenseChart: { height: 210, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  statColumn: { height: 182, justifyContent: "space-between", width: "24%" },
  stat: { alignItems: "center" },
  legendDot: { width: 20, height: 20, borderRadius: 7, marginBottom: 5 },
  statNumber: { color: "#fff", fontSize: 18, lineHeight: 25, fontWeight: "600" },
  legendRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  accountScroll: { gap: 12, paddingTop: 14, paddingRight: 6 },
  accountCard: { width: 122, minHeight: 148, borderWidth: 1, borderColor: WHITE[12], borderRadius: 22, backgroundColor: "#333333", padding: 12, justifyContent: "space-between" },
  bankMark: { width: 40, height: 40, borderWidth: 1, borderColor: "rgba(255,173,22,0.48)", borderRadius: 20, backgroundColor: "rgba(255,173,22,0.12)", alignItems: "center", justifyContent: "center" },
  accountAmount: { color: "#fff", fontSize: 20, lineHeight: 28, fontWeight: "500" },
  aiTeaser: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, marginBottom: 15, borderRadius: 18, borderWidth: 1, borderColor: WHITE[12], backgroundColor: "#222" },
  aiOrbSmall: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  orbLogo: { width: "100%", height: "100%" },
  bottomNav: { minHeight: 84, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingHorizontal: 12, paddingTop: 16, paddingBottom: 14, borderTopWidth: 2, borderColor: WHITE[24], borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: "rgba(32,32,32,0.96)" },
  navButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  navSend: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 9 } },
  tabContent: { paddingHorizontal: 20, paddingBottom: 28, flexGrow: 1 },
  cardCarousel: { height: 216, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginHorizontal: -20 },
  visualCard: { width: "79%", maxWidth: 320, aspectRatio: 1.56, borderRadius: 24, padding: 20, justifyContent: "space-between", shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 15 }, elevation: 8 },
  sideCard: { width: 38, height: 180, borderRadius: 15 },
  sideCardLeft: { backgroundColor: "#233ca5" },
  sideCardRight: { backgroundColor: "#db3b4c" },
  cardName: { color: "#fff", fontWeight: "600" },
  mastercard: { width: 40, height: 24, flexDirection: "row" },
  cardChip: { width: 35, height: 27, borderRadius: 5, backgroundColor: "#D5B568", alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 0.5, borderColor: "#8D753D" },
  cardNumber: { color: "#fff", fontSize: 20, letterSpacing: 0 },
  cardOwner: { color: "#fff", fontSize: 11 },
  sectionCaption: { color: MUTED, fontSize: 12, borderBottomWidth: 1, borderColor: WHITE[24], paddingBottom: 10, marginBottom: 12 },
  cardBalance: { color: "#fff", fontSize: 48, letterSpacing: -1.5, marginTop: 6, marginBottom: 22 },
  transactionHeader: { marginBottom: 0 },
  transaction: { flexDirection: "row", alignItems: "center", gap: 13, minHeight: 72, borderBottomWidth: 1, borderColor: WHITE[12] },
  transactionIcon: { width: 37, height: 37, borderRadius: 12, borderColor: "#24703d", borderWidth: 1, backgroundColor: "#21412a", alignItems: "center", justifyContent: "center" },
  moreButton: { width: 32, height: 32, borderWidth: 1.5, borderColor: WHITE[24], borderRadius: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 64 },
  menuCount: { color: GOLD, borderWidth: 1, borderColor: GOLD, borderRadius: 14, padding: 4, marginLeft: "auto" },
  aiScreen: { flex: 1 },
  aiContent: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  aiGreeting: { minHeight: 305, alignItems: "center", justifyContent: "center", gap: 18 },
  aiOrb: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: GOLD, shadowOpacity: 0.65, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 14 },
  suggestion: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: WHITE[12], borderRadius: 13, backgroundColor: "#222", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 7, shadowOffset: { width: 0, height: 5 } },
  messageGroup: { gap: 14, paddingTop: 16 },
  userMessage: { alignSelf: "flex-end", maxWidth: "92%", color: "#fff", backgroundColor: "#222", padding: 14, borderWidth: 1, borderColor: WHITE[12], borderRadius: 14 },
  response: { lineHeight: 21, marginVertical: 6 },
  chatInput: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderTopWidth: 2, borderColor: WHITE[24], borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#222" },
  micButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: WHITE[12], borderRadius: 12, backgroundColor: "#222", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
  chatTextInput: { flex: 1, minHeight: 36, color: "#fff", fontSize: 13, padding: 0 },
  sendChat: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
