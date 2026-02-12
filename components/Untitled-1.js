import { motion } from "framer-motion";

export default function NeonBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#00ffcc] via-[#0ff] to-[#00ffcc]" />

      <motion.div
        className="pointer-events-none"
        animate={{ opacity: [0.06, 0.11, 0.06] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
          <motion.div
            className="h-full bg-neon-green"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
