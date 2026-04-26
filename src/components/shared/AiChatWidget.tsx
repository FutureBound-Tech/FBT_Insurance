import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
}

const quickQuestions = [
  "Which plan is best?",
  "Tax benefits",
  "Bonus details",
  "Term vs Endowment",
];

function getAIResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("tax")) return "Section 80C: Deduct up to Rs 1.5L/year on premiums. Section 10(10D): Maturity is tax-free if premium is within limits. Endowment plans offer both benefits.";
  if (q.includes("term")) return "Term plans (Tech Term Plan 954) give maximum coverage at minimum cost. Example: 30yr old, Rs 1Cr cover is approx Rs 12,000/year. Pure protection for your family.";
  if (q.includes("child") || q.includes("education")) return "Amritbaal (Plan 974) is designed for children. Premiums paid during childhood, maturity at 18-25. Great for education planning.";
  if (q.includes("retire") || q.includes("pension")) return "For retirement: Jeevan Shanti (annuity) or Jeevan Umang (Plan 745) which gives 8% of SA yearly after premium paying term.";
  if (q.includes("best") || q.includes("which") || q.includes("recommend")) return "It depends on your goals! Term = max coverage, Endowment = savings + cover, ULIP = market growth. Try our Free Assessment for personalized recommendations.";
  if (q.includes("jeevan anand")) return "Jeevan Anand (Plan 715): Lifetime cover even after maturity. Death benefit = 125% of SA + Bonus + FAB. Age 30, 20yr, Rs 10L SA is approx Rs 35,000/year.";
  if (q.includes("bonus")) return "LIC declares Simple Reversionary Bonus annually (Rs 40-48/1000 SA for endowment). FAB (Final Additional Bonus) paid at maturity for 15+ year policies.";
  if (q.includes("premium")) return "Premium depends on Age, Term, Sum Assured and plan type. GST: 4.5% first year, 2.25% after. Use the Calculator page for exact figures!";
  if (q.includes("loan")) return "Most LIC endowment plans offer loan facility after acquiring surrender value. Loan amount is typically 80-90% of surrender value.";
  if (q.includes("surrender")) return "Surrender value is available after paying minimum premiums (usually 2-3 years). The amount depends on policy term completed and premiums paid.";
  return "Great question! I'd recommend using our Free Assessment for personalized recommendations based on your profile. You can also try the Calculator to compare different plans.";
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! Ask me anything about LIC policies, premiums, tax benefits, or which plan suits you best!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getAIResponse(text) }]);
    }, 600);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[360px] sm:w-[400px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">LIC Assistant</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[340px] bg-gray-50/30">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "bot" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 shrink-0 mr-3 mt-0.5">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "gradient-gold text-white rounded-br-md"
                        : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto shrink-0">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 whitespace-nowrap transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2 shrink-0">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask about LIC policies..."
                className="h-10 text-sm flex-1 rounded-xl"
              />
              <Button onClick={() => send(input)} size="sm" className="h-10 px-4 rounded-xl gradient-gold">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 transition-all duration-300 flex items-center justify-center",
          open
            ? "h-12 w-12 rounded-2xl bg-gray-200 hover:bg-gray-300 shadow-lg"
            : "h-14 w-14 rounded-2xl gradient-gold shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105"
        )}
      >
        {open ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
}
