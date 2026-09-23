import { useChatSocket } from "./useChatSocket";
import { useChatPolling } from "./useChatPolling";

// MODE قيمة ثابتة وقت الـ build (من import.meta.env)، مش بتتغير أثناء تشغيل
// التطبيق — فاختيار الـ hook هنا آمن تمامًا رغم شكله الشرطي، لإن نفس الفرع
// بيتنفذ في كل render طول عمر الصفحة، مش بيتقلب بين الاتنين.
const MODE = import.meta.env.VITE_REALTIME_MODE || "websocket";

export const useChatRealtime = (roomId, currentUserId) => {
  if (MODE === "polling") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useChatPolling(roomId);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useChatSocket(roomId, currentUserId);
};