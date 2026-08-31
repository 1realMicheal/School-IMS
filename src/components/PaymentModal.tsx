import React, { useState } from "react";
import { Student, School, FeeTransaction } from "../types";
import { formatGHS } from "../utils/grading";
import { X, Smartphone, CheckCircle, ShieldCheck, RefreshCw, CreditCard, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  school: School;
  onPaymentSuccess: (transaction: FeeTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  school,
  onPaymentSuccess,
}) => {
  const [network, setNetwork] = useState<"MTN_MOMO" | "TELECEL_CASH" | "AT_MONEY">("MTN_MOMO");
  const [phoneNumber, setPhoneNumber] = useState<string>("0244123456");
  const [amount, setAmount] = useState<number>(student.feeBalanceGHS || 250);
  const [feeType, setFeeType] = useState<"Tuition" | "PTA Dues" | "ICT & Science Levy">("Tuition");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"INPUT" | "USSD_PROMPT" | "SUCCESS">("INPUT");
  const [lastReference, setLastReference] = useState("");

  if (!isOpen) return null;

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep("USSD_PROMPT");

    // Simulate Ghana MoMo Network push prompt
    setTimeout(() => {
      setIsProcessing(false);
    }, 1200);
  };

  const handleConfirmUssd = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const ref = `MOMO-GH-${Math.floor(1000000 + Math.random() * 9000000)}`;
      setLastReference(ref);
      setPaymentStep("SUCCESS");

      const tx: FeeTransaction = {
        id: `tx-${Date.now()}`,
        schoolId: school.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        amountGHS: Number(amount),
        term: school.term,
        feeType: feeType,
        paymentMethod: network,
        reference: ref,
        date: new Date().toISOString().split("T")[0],
        status: "SUCCESSFUL",
      };

      onPaymentSuccess(tx);

      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ghana Mobile Money (MoMo) Checkout</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct fee settlement for {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {paymentStep === "INPUT" && (
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* Select Network */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Select MoMo Network:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNetwork("MTN_MOMO")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                      network === "MTN_MOMO"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-xs">MTN MoMo</span>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">*170#</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork("TELECEL_CASH")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                      network === "TELECEL_CASH"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-xs">Telecel Cash</span>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">*110#</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork("AT_MONEY")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                      network === "AT_MONEY"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-xs">AT Money</span>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">*110#</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="024XXXXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fee Category</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tuition">Term Tuition</option>
                    <option value="PTA Dues">PTA Dues</option>
                    <option value="ICT & Science Levy">ICT & Science Levy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount (GH₵)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-black text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Deduction:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-base">
                  {formatGHS(amount)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Proceed with MoMo Prompt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {paymentStep === "USSD_PROMPT" && (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">USSD Push Prompt Dispatched!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                A prompt has been sent to <strong className="text-indigo-700 dark:text-indigo-400">{phoneNumber}</strong>.
                Enter your 4-digit MoMo PIN to authorize deduction of{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-mono">{formatGHS(amount)}</strong> for {school.name}.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleConfirmUssd}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 mx-auto shadow-xs"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Simulate Authorize PIN Entered</span>
                </button>
              </div>
            </div>
          )}

          {paymentStep === "SUCCESS" && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Payment Received Successfully!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official Ghana MoMo receipt generated. Student fee balance has been updated in real-time.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transaction Ref:</span>
                  <span className="text-indigo-700 dark:text-indigo-400 font-bold">{lastReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{formatGHS(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Recipient School:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">{school.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payer Phone:</span>
                  <span className="text-slate-600 dark:text-slate-400">{phoneNumber}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition"
              >
                Close & Return to Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
