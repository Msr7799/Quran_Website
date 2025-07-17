import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/QuranChatBox.module.css";

// أيقونة القرآن الكريم
const QuranIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
    <path d="M12 7C10.9 7 10 7.9 10 9S10.9 11 12 11S14 10.1 14 9S13.1 7 12 7Z" fill="currentColor"/>
    <path d="M7 13H17V15H7V13Z" fill="currentColor"/>
    <path d="M7 16H17V18H7V16Z" fill="currentColor"/>
  </svg>
);

// أيقونة الإرسال
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
  </svg>
);

// أيقونة المصحف
const MushaafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20Z" fill="#2E7D32"/>
    <path d="M8 6H16V8H8V6Z" fill="#2E7D32"/>
    <path d="M8 10H16V12H8V10Z" fill="#2E7D32"/>
    <path d="M8 14H13V16H8V14Z" fill="#2E7D32"/>
  </svg>
);

export const QuranChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // تحميل المحادثات المحفوظة عند بدء التشغيل
  useEffect(() => {
    const savedConversations = localStorage.getItem('quranChatHistory');
    if (savedConversations) {
      try {
        setConversations(JSON.parse(savedConversations));
      } catch (e) {
        console.error('فشل في تحميل المحادثات المحفوظة:', e);
      }
    }
  }, []);

  // حفظ المحادثات في التخزين المحلي عندما تتغير
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('quranChatHistory', JSON.stringify(conversations));
    }
  }, [conversations]);

  // التمرير إلى آخر رسالة عندما تتغير المحادثات أو عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [conversations, isOpen]);

  // التركيز على حقل الإدخال عند فتح النافذة
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addMessage = (content, sender) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA');
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: timeStr,
      sender
    };

    setConversations(prevConversations => {
      // البحث عن مجموعة المحادثة لليوم الحالي
      const todayGroupIndex = prevConversations.findIndex(group => group.date === dateStr);
      
      if (todayGroupIndex > -1) {
        // إذا وجدت مجموعة لليوم الحالي، أضف الرسالة إليها
        const updatedGroups = [...prevConversations];
        updatedGroups[todayGroupIndex] = {
          ...updatedGroups[todayGroupIndex],
          messages: [...updatedGroups[todayGroupIndex].messages, newMessage]
        };
        return updatedGroups;
      } else {
        // إذا لم توجد مجموعة لليوم الحالي، أنشئ واحدة جديدة
        return [
          ...prevConversations,
          { date: dateStr, messages: [newMessage] }
        ];
      }
    });
  };

  // دالة محاكاة الذكاء الاصطناعي للقرآن الكريم
  const askQuranAI = async (message) => {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ردود محاكاة للقرآن الكريم
    const quranResponses = {
      default: "السلام عليكم ورحمة الله وبركاته، أنا مساعدك في موقع القرآن الكريم. يمكنني مساعدتك في:\n\n📖 تفسير الآيات\n🕌 معلومات عن السور\n🎵 القراءات والتلاوات\n📚 أحكام التجويد\n💡 فوائد قرآنية\n\nكيف يمكنني خدمتك؟",
      
      sura: "يمكنني مساعدتك في معرفة معلومات شاملة عن أي سورة:\n\n• أسباب النزول\n• المكان: مكية أم مدنية\n• عدد الآيات والكلمات\n• الموضوعات الرئيسية\n• الدروس المستفادة\n\nأي سورة تود أن تعرف عنها أكثر؟",
      
      tafsir: "التفسير هو بيان معاني القرآن الكريم وتوضيح مراد الله عز وجل. من أشهر كتب التفسير:\n\n📚 تفسير ابن كثير\n📚 تفسير الطبري\n📚 تفسير القرطبي\n📚 تفسير السعدي\n\nهل تريد تفسير آية معينة أم معلومات عن منهج تفسير محدد؟",
      
      recitation: "عالم التلاوة غني بالقراء العظام:\n\n🎙️ القراء الكلاسيكيون:\n• الشيخ عبد الباسط عبد الصمد\n• الشيخ محمد صديق المنشاوي\n• الشيخ محمود خليل الحصري\n\n🎙️ القراء المعاصرون:\n• الشيخ مشاري العفاسي\n• الشيخ ماهر المعيقلي\n• الشيخ عبد الرحمن السديس\n\nأي قارئ تفضل أم تريد توصيات حسب نوع التلاوة؟",
      
      ayah: "يمكنني مساعدتك في:\n\n🔍 البحث عن آية محددة\n📝 تفسير معاني الآيات\n🎯 أسباب النزول\n💎 الفوائد والحكم\n📖 السياق القرآني\n\nاكتب الآية أو جزءًا منها وسأساعدك في فهمها بإذن الله.",
      
      dua: "أدعية القرآن الكريم كنوز عظيمة:\n\n🤲 من الأدعية الجامعة:\n• ﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ﴾\n• ﴿رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا﴾\n• ﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾\n\nهل تريد أدعية لمناسبة معينة؟",
      
      memorization: "نصائح ذهبية لحفظ القرآن الكريم:\n\n📅 النظام والثبات:\n• حدد وردًا يوميًا ثابتًا\n• اختر وقتًا مباركًا (بعد الفجر مثلاً)\n\n🔄 المراجعة:\n• راجع المحفوظ قبل الحفظ الجديد\n• استخدم قاعدة: احفظ صفحة، راجع خمس\n\n🎧 الاستماع:\n• اختر قارئًا واحدًا للحفظ\n• استمع كثيرًا للمقاطع المراد حفظها\n\nكم تحفظ حاليًا وما هدفك؟",
      
      tajweed: "علم التجويد يحسن تلاوتك:\n\n🎯 الأحكام الأساسية:\n• النون الساكنة والتنوين\n• الميم الساكنة\n• أحكام المد\n• الوقف والابتداء\n\n📚 مصادر التعلم:\n• متن تحفة الأطفال\n• شرح المنظومة الجزرية\n• التطبيق العملي مع شيخ\n\nأي حكم تريد تعلمه؟",
      
      benefits: "فوائد تدبر القرآن عظيمة:\n\n💎 فوائد روحية:\n• طمأنينة القلب\n• زيادة الإيمان\n• الهداية والنور\n\n🌟 فوائد عملية:\n• حلول للمشاكل\n• تطوير الأخلاق\n• إرشاد في اتخاذ القرارات\n\nهل تريد فوائد من سورة أو آية معينة؟",
      
      search: "يمكنني مساعدتك في البحث عن:\n\n🔍 البحث بالموضوع:\n• آيات الدعاء\n• قصص الأنبياء\n• أحكام شرعية\n\n🔍 البحث بالكلمات:\n• ابحث عن كلمة أو عبارة\n• آيات تحتوي على اسم معين\n\nما الذي تبحث عنه تحديدًا؟"
    };

    const lowerMessage = message.toLowerCase();
    
    // التحقق من كلمات محددة للسور
    if (lowerMessage.includes('سورة') || lowerMessage.includes('سوره')) {
      return quranResponses.sura;
    } else if (lowerMessage.includes('تفسير') || lowerMessage.includes('معنى') || lowerMessage.includes('شرح')) {
      return quranResponses.tafsir;
    } else if (lowerMessage.includes('قراءة') || lowerMessage.includes('قارئ') || lowerMessage.includes('تلاوة') || lowerMessage.includes('صوت')) {
      return quranResponses.recitation;
    } else if (lowerMessage.includes('آية') || lowerMessage.includes('ايه') || lowerMessage.includes('آيات')) {
      return quranResponses.ayah;
    } else if (lowerMessage.includes('دعاء') || lowerMessage.includes('ادعية') || lowerMessage.includes('دعاء')) {
      return quranResponses.dua;
    } else if (lowerMessage.includes('حفظ') || lowerMessage.includes('تحفيظ') || lowerMessage.includes('حافظ')) {
      return quranResponses.memorization;
    } else if (lowerMessage.includes('تجويد') || lowerMessage.includes('احكام') || lowerMessage.includes('قراءة صحيحة')) {
      return quranResponses.tajweed;
    } else if (lowerMessage.includes('فائدة') || lowerMessage.includes('فوائد') || lowerMessage.includes('حكمة') || lowerMessage.includes('درس')) {
      return quranResponses.benefits;
    } else if (lowerMessage.includes('بحث') || lowerMessage.includes('ابحث') || lowerMessage.includes('اجد') || lowerMessage.includes('اين')) {
      return quranResponses.search;
    } else if (lowerMessage.includes('السلام') || lowerMessage.includes('مرحبا') || lowerMessage.includes('أهلا')) {
      return "وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بك في موقع القرآن الكريم. " + quranResponses.default;
    } else if (lowerMessage.includes('شكرا') || lowerMessage.includes('جزاك الله')) {
      return "وإياكم، بارك الله فيكم. هل تحتاجون لمساعدة أخرى في تعلم أو فهم القرآن الكريم؟";
    } else {
      return quranResponses.default;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // إضافة رسالة المستخدم
    addMessage(userMessage, 'user');
    
    // عرض مؤشر الكتابة
    setIsTyping(true);
    
    try {
      // إرسال الرسالة إلى مساعد القرآن الكريم والحصول على الرد
      const aiResponse = await askQuranAI(userMessage);
      
      // إضافة رد المساعد بعد تأخير قصير لإظهار تأثير الكتابة
      setTimeout(() => {
        setIsTyping(false);
        addMessage(aiResponse, 'ai');
      }, 500);
    } catch (error) {
      console.error('خطأ في الاتصال بمساعد القرآن الكريم:', error);
      
      setTimeout(() => {
        setIsTyping(false);
        addMessage('عذرًا، حدث خطأ أثناء محاولة الاتصال بمساعد القرآن الكريم. يرجى المحاولة مرة أخرى.', 'ai');
      }, 500);
    }
  };

  const clearConversation = () => {
    if (window.confirm('هل أنت متأكد أنك تريد مسح جميع المحادثات؟')) {
      setConversations([]);
      localStorage.removeItem('quranChatHistory');
    }
  };

  return (
    <div className={styles.quranChatContainer}>
      {/* زر فتح الدردشة */}
      <button 
        onClick={handleToggleChat}
        className={styles.chatButton}
        title="مساعد القرآن الكريم"
      >
        <QuranIcon />
      </button>
      
      {/* نافذة الدردشة */}
      <div 
        className={`${styles.chatWindow} ${isOpen ? '' : styles.collapsed}`}
      >
        {/* رأس النافذة */}
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <MushaafIcon />
            <div>
              <div>مساعد القرآن الكريم</div>
              <div className={styles.chatSubtitle}>في خدمة كتاب الله</div>
            </div>
          </div>
          <div className={styles.chatControls}>
            {/* زر مسح المحادثة */}
            <button 
              onClick={clearConversation}
              className={styles.controlButton}
              title="مسح المحادثة"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
              </svg>
            </button>
            {/* زر إغلاق */}
            <button 
              onClick={handleToggleChat}
              className={styles.controlButton}
              title="إغلاق"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* منطقة المحادثات */}
        <div className={styles.conversationArea}>
          {conversations.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <MushaafIcon />
              </div>
              <div className={styles.emptyTitle}>السلام عليكم ورحمة الله وبركاته</div>
              <div className={styles.emptySubtitle}>كيف يمكنني مساعدتك في تعلم القرآن الكريم؟</div>
            </div>
          )}
          
          {conversations.map((group) => (
            <React.Fragment key={group.date}>
              <div className={styles.dateSeparator}>
                <span className={styles.dateBadge}>{group.date}</span>
              </div>
              <div className={styles.messageGroup}>
                {group.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageContainer} ${styles[message.sender]}`}
                  >
                    <div className={`${styles.messageBubble} ${styles[message.sender]}`}>
                      <div>{message.content}</div>
                      <div className={`${styles.messageTimestamp} ${styles[message.sender]}`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
          
          {/* مؤشر الكتابة */}
          {isTyping && (
            <div className={`${styles.messageContainer} ${styles.ai}`}>
              <div className={styles.typingIndicator}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* منطقة الإدخال */}
        <div className={styles.chatInputArea}>
          <div className={styles.inputContainer}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="اسأل عن القرآن الكريم..."
              className={styles.messageInput}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className={styles.sendButton}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
