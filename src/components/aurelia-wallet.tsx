"use client";

import { useState, type ReactNode } from "react";
import "./aurelia-wallet.css";

type Tab = "wallet" | "cards" | "menu" | "ai" | "recipients";
type AuthScreen = "welcome" | "login" | "signup" | "app";
type SendStep = 0 | 1 | 2 | 3 | 4;

const people = [
  ["Emily Johnson", "9638934867458", "👩🏻‍🎤"],
  ["Charlotte Anderson", "9638934867458", "👩🏻‍💼"],
  ["Christopher Wilson", "9638934867458", "👨🏽‍🎤"],
  ["Isak Taylor", "9638934867458", "👨🏻‍🎨"],
  ["Ava Brown", "9638934867458", "👩🏽‍🦱"],
];

const suggestions = [
  "Visualize a dashboard summarizing spending trends for better insights",
  "Show me my last 3 transactions to Pablo Morales",
  "Track spending habits and get personalized budgeting tips",
  "Show me the unpaid bills for this month",
];

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    sparkle: <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z M19 14l1.2 3.1L23 18l-2.8 1-1.2 3-1-3-3-1 3-1 1-3Z" />,
    trend: <path d="m3 17 6-6 4 4 8-9m-6 0h6v6" />,
    wallet: <><path d="M4 6.5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h13" /><path d="M16 13h5m-4 0h.01" /></>,
    arrows: <><path d="M7 7h13l-3-3m3 3-3 3M17 17H4l3 3m-3-3 3-3" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    up: <><path d="M12 19V5m-7 7 7-7 7 7" /></>,
    down: <><path d="M12 5v14m-7-7 7 7 7-7" /></>,
    scan: <><path d="M4 9V5a1 1 0 0 1 1-1h4m6 0h4a1 1 0 0 1 1 1v4M4 15v4a1 1 0 0 0 1 1h4m6 0h4a1 1 0 0 0 1-1v-4" /><circle cx="12" cy="12" r="3" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    back: <path d="m15 18-6-6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z" /></>,
    person: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
    more: <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}

function Button({
  children,
  onClick,
  secondary = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`aw-button${secondary ? " aw-button-secondary" : ""} ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function TopBar({
  title,
  onBack,
  leading,
  trailing,
}: {
  title: string;
  onBack?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <header className="aw-topbar">
      <button className="aw-icon-button" aria-label="Go back" onClick={onBack}>
        {onBack ? <Icon name="back" /> : leading}
      </button>
      <span>{title}</span>
      <div className="aw-topbar-trailing">{trailing}</div>
    </header>
  );
}

function Progress({ active, labels }: { active: number; labels: string[] }) {
  return (
    <div className="aw-progress">
      {labels.map((label, index) => (
        <div
          className={`aw-progress-item${index < active ? " is-complete" : ""}${index === active ? " is-active" : ""}`}
          key={label}
        >
          <span>{index < active ? <Icon name="check" size={14} /> : null}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

export function AureliaWallet() {
  const [auth, setAuth] = useState<AuthScreen>("welcome");
  const [tab, setTab] = useState<Tab>("wallet");
  const [sendStep, setSendStep] = useState<SendStep | null>(null);
  const [signupStep, setSignupStep] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(2);
  const [selectedCard, setSelectedCard] = useState(1);
  const [activeCard, setActiveCard] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const enterWallet = () => {
    setAuth("app");
    setTab("wallet");
    setSendStep(null);
  };
  const startSend = () => setSendStep(0);
  const goNext = () =>
    setSendStep((step) => (step === null ? null : Math.min(step + 1, 4) as SendStep));
  const goSignupNext = () =>
    setSignupStep((step) => Math.min(step + 1, 3));
  const sendMessage = (message = prompt) => {
    if (!message.trim()) return;
    setChat((messages) => [...messages, message.trim()]);
    setPrompt("");
  };

  if (auth === "welcome") {
    return (
      <main className="aw-app aw-welcome">
        <span className="aw-welcome-island" aria-hidden="true" />
        <div className="aw-welcome-content">
          <div className="aw-brand-mark"><span>♞</span></div>
          <div className="aw-brand-name">Aurelia</div>
          <p className="aw-tagline">Believe in the Golden Rule,<br />Gold always Rules.</p>
          <span className="aw-gold-dash" />
        </div>
        <div className="aw-welcome-actions">
          <button className="aw-face-button" onClick={() => setAuth("login")} aria-label="Scan my face">
            <Icon name="scan" size={28} />
          </button>
          <span>Scan my face</span>
          <Button onClick={() => setAuth("login")}>Login</Button>
          <div className="aw-or"><span>OR</span></div>
          <Button secondary onClick={() => { setAuth("signup"); setSignupStep(0); }}>Sign up</Button>
        </div>
      </main>
    );
  }

  if (auth === "login") {
    return (
      <main className="aw-app">
        <TopBar title="Login" onBack={() => setAuth("welcome")} />
        <section className="aw-auth-content">
          <h1 className="aw-display">Add your details and login into your account today</h1>
          <span className="aw-gold-dash" />
          <label className="aw-field"><span>Account number</span><input defaultValue="98639234" /></label>
          <label className="aw-field"><span>Password</span><input type="password" defaultValue="password123456" /></label>
          <label className="aw-check"><input type="checkbox" /> Save login info</label>
          <Button onClick={enterWallet}>Login</Button>
          <div className="aw-or"><span>OR</span></div>
          <Button secondary onClick={() => { setAuth("signup"); setSignupStep(0); }}>Sign up</Button>
          <button className="aw-scan-link" onClick={enterWallet}><Icon name="scan" />Scan my face</button>
        </section>
      </main>
    );
  }

  if (auth === "signup") {
    return (
      <main className="aw-app">
        <TopBar title="Create an account" onBack={() => signupStep ? setSignupStep(signupStep - 1) : setAuth("welcome")} />
        <Progress active={signupStep} labels={["Details", "Face scan", "Security"]} />
        <section className={`aw-signup-panel${signupStep === 3 ? " aw-success-panel" : ""}`}>
          {signupStep === 0 && <>
            <h1 className="aw-display">Add your details</h1><span className="aw-gold-dash" />
            <div className="aw-field-row">
              <label className="aw-field"><span>First name</span><input defaultValue="Ismail" /></label>
              <label className="aw-field"><span>Last name</span><input defaultValue="Mesbah" /></label>
            </div>
            <label className="aw-field"><span>Email address</span><input type="email" placeholder="you@example.com" /></label>
            <label className="aw-field"><span>Account number</span><input defaultValue="98639234" /></label>
            <label className="aw-field"><span>Password</span><input type="password" placeholder="Create a password" /></label>
            <label className="aw-field"><span>Repeat password</span><input type="password" placeholder="Repeat your password" /></label>
            <label className="aw-check"><input type="checkbox" /> I agree to the <a href="#terms">Terms of Service</a></label>
            <Button onClick={goSignupNext}>Next</Button>
          </>}
          {signupStep === 1 && <>
            <h1 className="aw-display">Scan your face</h1><span className="aw-gold-dash" />
            <div className="aw-face-scan" aria-label="Face scan preview">
              <div className="aw-face-scan-inner"><Icon name="person" size={92} /></div>
            </div>
            <ul className="aw-scan-instructions">
              <li>Look straight into the camera</li>
              <li>Remove glasses, hats, or masks</li>
              <li>Find good lighting</li>
            </ul>
            <Button onClick={goSignupNext}>Next</Button>
          </>}
          {signupStep === 2 && <>
            <h1 className="aw-display">Verify your phone number</h1><span className="aw-gold-dash" />
            <div className="aw-verify-icon"><Icon name="phone" size={48} /></div>
            <div className="aw-otp">{["5", "4", "2", "0", "0", "6"].map((digit, i) => <span key={i}>{digit}</span>)}</div>
            <Button onClick={goSignupNext}>Next</Button>
          </>}
          {signupStep === 3 && <div className="aw-success-content">
            <div className="aw-success-icon"><Icon name="check" size={36} /></div>
            <h1 className="aw-display">Your account is set!</h1>
            <p>After a few simple steps, your wallet account is ready to go. Add funds and start using Aurelia.</p>
            <Button onClick={enterWallet}> <Icon name="check" size={17} /> Got it</Button>
          </div>}
        </section>
      </main>
    );
  }

  if (sendStep !== null) {
    return (
      <main className="aw-app">
        <TopBar title="Send money" onBack={() => sendStep === 0 ? setSendStep(null) : setSendStep((sendStep - 1) as SendStep)} />
        <Progress active={sendStep === 4 ? 4 : sendStep} labels={["Amount", "Recipient", "Method", "Pay"]} />
        <section className={`aw-send-panel${sendStep === 4 ? " aw-send-success" : ""}`}>
          {sendStep === 0 && <>
            <label className="aw-field"><span>You send</span><div className="aw-amount-input"><input defaultValue="$ 1,000" aria-label="Amount to send" /><span>🇺🇸 USD⌄</span></div></label>
            <div className="aw-fee-card"><p><span>Conversion Fee</span><span>$5.00</span></p><p><span>Transfer Fee</span><span>2.5%</span></p><hr /><p><span>Amount to transfer</span><span>$978.23</span></p></div>
            <label className="aw-field"><span>Recipient gets</span><div className="aw-amount-input"><input defaultValue="€ 982.73" aria-label="Recipient amount" /><span>🇪🇺 EUR⌄</span></div></label>
            <p className="aw-muted aw-transfer-time">ⓘ &nbsp;Transfer will take 5 hours</p>
          </>}
          {sendStep === 1 && <>
            <label className="aw-search"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipients" /></label>
            <div className="aw-recipient-list">{people.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())).map(([name, number, avatar], index) => <button className={`aw-recipient${selectedPerson === index ? " is-selected" : ""}`} key={name} onClick={() => setSelectedPerson(index)}><span className="aw-avatar">{avatar}</span><span className="aw-person-copy"><strong>{name}</strong><small>{number}</small></span><span className="aw-radio">{selectedPerson === index && <Icon name="check" size={13} />}</span></button>)}</div>
          </>}
          {sendStep === 2 && <>
            <label className="aw-field"><span>Total sending</span><div className="aw-amount-input"><input defaultValue="$ 1,000" aria-label="Total sending" /></div></label>
            <p className="aw-section-label">Select card</p>
            <div className="aw-payment-cards">{["$23,480.52", "$7,430.52", "$7,480.52"].map((balance, index) => <button className={`aw-payment-card${selectedCard === index ? " is-selected" : ""}`} key={balance} onClick={() => setSelectedCard(index)}><span className={`aw-card-chip chip-${index}`}><Icon name="wallet" /></span><span><strong>{balance}</strong><small>•••• &nbsp;•••• &nbsp;•••• &nbsp;3465</small></span><span className="aw-radio">{selectedCard === index && <Icon name="check" size={13} />}</span></button>)}</div>
          </>}
          {sendStep === 3 && <>
            <p className="aw-summary-label">Amount</p><h2 className="aw-summary-amount">€ 982.73</h2>
            <p className="aw-summary-label">Recipient</p><div className="aw-summary-person"><span className="aw-avatar">👩🏻‍🎤</span><span><strong>{people[selectedPerson]?.[0] ?? "James Parker"}</strong><small>recipient@email.com</small></span></div>
            <p className="aw-summary-label">Card selected</p><div className="aw-summary-person"><span className={`aw-card-chip chip-${selectedCard}`}><Icon name="wallet" /></span><span><strong>Junior Card</strong><small>1204 &nbsp;**** &nbsp;**** &nbsp;3756</small></span></div>
            <p className="aw-summary-label">Recipient gets</p>
            <div className="aw-fee-card"><p><span>Conversion Fee</span><span>$5.00</span></p><p><span>Transfer Fee</span><span>2.5%</span></p><p><span>Amount to transfer</span><span>$978.23</span></p></div>
            <div className="aw-total"><span>Total</span><strong>€ 982.73</strong></div>
          </>}
          {sendStep === 4 && <div className="aw-success-content">
            <div className="aw-success-icon"><Icon name="check" size={36} /></div>
            <h1>Successful operation!</h1>
            <p>Your transfer is on its way. You can follow its progress in your activity.</p>
            <Button onClick={() => setSendStep(null)}><Icon name="check" size={17} /> Got it</Button>
          </div>}
          {sendStep < 3 && <Button className="aw-send-next" onClick={goNext}>Pay</Button>}
          {sendStep === 3 && <Button className="aw-review-next" onClick={goNext}>Pay</Button>}
        </section>
      </main>
    );
  }

  return (
    <main className={`aw-app aw-main-app${tab === "ai" ? " aw-ai-app" : ""}`}>
      <TopBar
        title={tab === "wallet" ? "Wallet" : tab === "cards" ? "My cards" : tab === "menu" ? "Menu" : tab === "recipients" ? "Recipients" : "AI Chat"}
        onBack={tab === "ai" ? () => setTab("wallet") : undefined}
        leading={tab === "ai" ? undefined : <Icon name="sparkle" />}
        trailing={tab === "ai" ? undefined : <button className="aw-icon-button" onClick={() => setTab("ai")} aria-label="Open insights"><Icon name="trend" /></button>}
      />
      {tab === "wallet" && <section className="aw-dashboard">
        <article className="aw-card aw-balance">
          <div className="aw-card-heading"><span>Balance<small>Today, 21 Feb</small></span><button className="aw-add-button" onClick={() => setSendStep(0)}><Icon name="plus" size={16} /> Add</button></div>
          <div className="aw-balance-amount">$238,219<span>.32</span></div>
          <div className="aw-quick-actions">
            {[["up", "Send"], ["down", "Receive"], ["scan", "Scan"], ["arrows", "Convert"]].map(([icon, label]) => <button key={label} onClick={label === "Send" ? startSend : () => setTab("cards")}><span><Icon name={icon} /></span>{label}</button>)}
          </div>
        </article>
        <article className="aw-card aw-expenses">
          <div className="aw-card-heading"><span>Expenses<small>This week, 14 – 21 Feb</small></span><button className="aw-period"><span>▢</span> This week</button></div>
          <div className="aw-expense-layout"><div className="aw-expense-stat"><i /><strong>21%</strong><small>Bills &amp; Debt</small></div><div className="aw-donut"><span>Expenses</span><strong>$10,262</strong></div><div className="aw-expense-stat"><i /><strong>21%</strong><small>Bills &amp; Debt</small></div></div>
          <div className="aw-expense-bottom"><span><i /><strong>21%</strong><small>Bills &amp; Debt</small></span><span><i /><strong>21%</strong><small>Shopping</small></span></div>
        </article>
        <article className="aw-card aw-activity">
          <div className="aw-card-heading"><span>Activity<small>This week, 14 – 21 Feb</small></span><button className="aw-period"><span>▢</span> This month</button></div>
          <div className="aw-chart"><div className="aw-chart-grid"><span>$25k</span><span>$10k</span><span>$5k</span><span>$1k</span></div><svg viewBox="0 0 320 130" preserveAspectRatio="none" aria-label="Spending activity chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffb52e" stopOpacity=".75" /><stop offset="1" stopColor="#ffb52e" stopOpacity=".04" /></linearGradient></defs><path d="M0 85 42 68 83 76 125 42 166 57 208 36 250 54 291 40 320 58V130H0Z" fill="url(#chartFill)" /><path d="M0 85 42 68 83 76 125 42 166 57 208 36 250 54 291 40 320 58" fill="none" stroke="#ffb52e" strokeWidth="2.4" /></svg></div>
          <div className="aw-chart-legend"><span>Earnings <strong>+23% ↗</strong></span><span>Expenses <strong>+23% ↙</strong></span></div>
        </article>
        <article className="aw-card aw-accounts">
          <div className="aw-card-heading"><span>My accounts</span><button className="aw-add-button" onClick={() => setTab("cards")}><Icon name="plus" size={16} /> Add</button></div>
          <div className="aw-account-row">{["PayPal Account", "PayPal Account", "Savings"].map((name, index) => <button className="aw-account-card" key={`${name}${index}`} onClick={() => setTab("cards")}><span className="aw-bank-icon">♙</span><small>{name}</small><strong>$12,724</strong></button>)}</div>
        </article>
        <button className="aw-ai-teaser" onClick={() => setTab("ai")}><span className="aw-ai-orb">♞</span><span><strong>Your money, made clearer</strong><small>Ask Aurelia AI for a personal insight</small></span><Icon name="back" /></button>
      </section>}
      {tab === "cards" && <section className="aw-tab-content">
        <div className="aw-card-carousel"><button onClick={() => setActiveCard((activeCard + 3) % 4)} aria-label="Previous card">‹</button><div className={`aw-visual-card aw-visual-${activeCard % 4}`}><div className="aw-visual-card-top"><strong>{activeCard === 0 ? "Junior Card" : "Aurelia Card"}</strong><span className="aw-mastercard"><i /><i /></span></div><span className="aw-card-chip-metal"><i /></span><span className="aw-card-number">1204&nbsp; 3756&nbsp; 3984&nbsp; 3756</span><div className="aw-visual-card-bottom"><span>Aurelia Kaizer</span><span>14/28</span></div></div><button onClick={() => setActiveCard((activeCard + 1) % 4)} aria-label="Next card">›</button></div>
        <div className="aw-carousel-dots">{[0, 1, 2, 3].map((dot) => <button aria-label={`Show card ${dot + 1}`} className={dot === activeCard ? "is-active" : ""} key={dot} onClick={() => setActiveCard(dot)} />)}</div>
        <div className="aw-card-amount-label">Card amount</div><div className="aw-card-total">$31,204<span>.94</span></div>
        <div className="aw-section-title">Latest transactions</div>{["Electricity", "Electricity", "Groceries"].map((name, index) => <div className="aw-transaction" key={`${name}${index}`}><span className="aw-transaction-icon"><Icon name="up" /></span><span><strong>{name}</strong><small>9:53 AM</small></span><b>+4.000</b></div>)}
        <Button onClick={() => setTab("menu")}><Icon name="plus" /> Add new card</Button>
      </section>}
      {tab === "menu" && <section className="aw-tab-content aw-menu-content">
        <div className="aw-profile"><span className="aw-profile-avatar">👩🏼‍💼</span><span><strong>Aurelia Kaiser</strong><small>View profile</small></span><button className="aw-period"><Icon name="edit" size={15} /> Edit</button></div>
        {["Subscriptions", "Recipients", "Payments", "Utilities", "Shopping list", "Support", "FAQs", "Logout"].map((item, index) => <button className="aw-menu-item" key={item} onClick={() => item === "Recipients" ? setTab("recipients") : item === "Logout" ? setAuth("welcome") : item === "Payments" ? startSend() : setTab("cards")}><span className="aw-menu-icon">{["▣", "♟", "▧", "⌘", "♧", "◉", "ⓘ", "↪"][index]}</span>{item}{index === 0 || index === 4 ? <small className="aw-menu-count">{index === 0 ? "2" : "15"}</small> : null}</button>)}
      </section>}
      {tab === "recipients" && <section className="aw-tab-content aw-recipients-content">
        <div className="aw-profile"><span className="aw-avatar">👩🏻‍🎤</span><span><strong className="aw-display">Liam Hawthorne</strong><small>Added on 11 Feb 2023</small></span><button className="aw-icon-button"><Icon name="more" /></button></div>
        <article className="aw-card aw-history"><p>Today, 11 Feb 2025</p>{["Send funds", "Send funds", "Receive funds"].map((item, index) => <div className="aw-transaction" key={`${item}${index}`}><span className="aw-transaction-icon"><Icon name={index === 2 ? "down" : "up"} /></span><span><strong>{item}</strong><small>9:53 AM</small></span><b>{index === 2 ? "−1.000" : "+4.000"}</b></div>)}</article>
        <div className="aw-section-title">Actions</div><div className="aw-recipient-actions">{["Send funds", "Request", "Edit"].map((item, index) => <button key={item} onClick={index === 0 ? startSend : () => setTab("menu")}><span><Icon name={index === 0 ? "up" : index === 1 ? "down" : "edit"} /></span>{item}</button>)}</div>
      </section>}
      {tab === "ai" && <section className="aw-tab-content aw-chat-content">
        {chat.length === 0 ? <div className="aw-chat-welcome"><span className="aw-ai-orb">♞</span><h1 className="aw-display">Hi, how can I help you today?</h1></div> : <div className="aw-chat-messages">{chat.map((message, index) => <div className="aw-chat-pair" key={`${message}${index}`}><div className="aw-chat-user">{message}</div><p>Here is a helpful overview based on your recent activity. Your spending is on track, and your balance is looking healthy.</p><div className="aw-insight-card"><strong>My spending trends</strong><div className="aw-mini-chart"><span /><span /><span /><span /><span /><span /><span /></div><small>Your spending has stayed consistent over the past few months.</small></div><div className="aw-chat-feedback">Are you satisfied with this answer? &nbsp; <button>✓ Yes</button><button>× No</button></div></div>)}</div>}
        {chat.length === 0 && <div className="aw-suggestions">{suggestions.map((item) => <button key={item} onClick={() => sendMessage(item)}><span className="aw-suggestion-copy">{item}</span><span>›</span></button>)}</div>}
        <form className="aw-chat-input" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><button type="button" aria-label="Voice input"><Icon name="mic" /></button><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask anything" /><button className="aw-chat-submit" aria-label="Send message"><Icon name="up" /></button></form>
      </section>}
      {tab !== "ai" && <nav className="aw-bottom-nav" aria-label="Main navigation">
        {([["wallet", "wallet", "Wallet"], ["arrows", "recipients", "Transfers"], ["plus", "send", "Send"], ["card", "cards", "Cards"], ["menu", "menu", "Menu"]] as const).map(([icon, destination, label]) => <button className={`${tab === destination ? "is-active" : ""}${destination === "send" ? " aw-nav-send" : ""}`} key={destination} onClick={() => destination === "send" ? startSend() : setTab(destination)} aria-label={label}><Icon name={icon} size={destination === "send" ? 26 : 23} /></button>)}
      </nav>}
    </main>
  );
}
