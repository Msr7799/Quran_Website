// ملف اختبار لوحدة قراءة الأحاديث
// يمكن تشغيله للتأكد من أن النظام يعمل بشكل صحيح

import hadithReader from './hadithDataReader.js';

async function runTests() {
  console.log('🧪 بدء اختبار وحدة قراءة الأحاديث...\n');

  try {
    // اختبار 1: تحميل البيانات والحصول على الإحصائيات
    console.log('📊 اختبار 1: الحصول على إحصائيات البيانات');
    const stats = await hadithReader.getDataStats();
    console.log('النتيجة:', stats);
    console.log('✅ نجح الاختبار 1\n');

    // اختبار 2: الحصول على حديث عشوائي
    console.log('🎲 اختبار 2: الحصول على حديث عشوائي');
    const randomHadith = await hadithReader.getRandomHadith();
    console.log('المصدر:', randomHadith.book);
    console.log('الرقم:', randomHadith.hadithNumber);
    console.log('بداية الحديث:', randomHadith.hadithText?.substring(0, 150) + '...');
    console.log('✅ نجح الاختبار 2\n');

    // اختبار 3: الحصول على حديث من البخاري
    console.log('📚 اختبار 3: الحصول على حديث من البخاري');
    const bukhariHadith = await hadithReader.getRandomHadith('البخاري');
    console.log('المصدر:', bukhariHadith.book);
    console.log('الرقم:', bukhariHadith.hadithNumber);
    console.log('بداية الحديث:', bukhariHadith.hadithText?.substring(0, 150) + '...');
    console.log('✅ نجح الاختبار 3\n');

    // اختبار 4: الحصول على حديث من مسلم
    console.log('📖 اختبار 4: الحصول على حديث من مسلم');
    const muslimHadith = await hadithReader.getRandomHadith('مسلم');
    console.log('المصدر:', muslimHadith.book);
    console.log('الرقم:', muslimHadith.hadithNumber);
    console.log('بداية الحديث:', muslimHadith.hadithText?.substring(0, 150) + '...');
    console.log('✅ نجح الاختبار 4\n');

    // اختبار 5: البحث في الأحاديث
    console.log('🔍 اختبار 5: البحث عن كلمة "الصلاة"');
    const searchResults = await hadithReader.searchHadiths('الصلاة');
    console.log(`عدد النتائج: ${searchResults.length}`);
    if (searchResults.length > 0) {
      console.log('مثال من النتائج:', searchResults[0].hadith?.substring(0, 100) + '...');
    }
    console.log('✅ نجح الاختبار 5\n');

    // اختبار 6: الحصول على أحاديث البخاري
    console.log('📚 اختبار 6: الحصول على أحاديث البخاري');
    const bukhariHadiths = await hadithReader.getHadithsBySource('البخاري');
    console.log(`عدد أحاديث البخاري: ${bukhariHadiths.length}`);
    console.log('✅ نجح الاختبار 6\n');

    console.log('🎉 تمت جميع الاختبارات بنجاح!');
    console.log('📋 ملخص النتائج:');
    console.log(`   - إجمالي الأحاديث: ${stats.total}`);
    console.log(`   - أحاديث البخاري: ${stats.bukhari}`);
    console.log(`   - أحاديث مسلم: ${stats.muslim}`);
    console.log(`   - أحاديث أخرى: ${stats.other}`);

  } catch (error) {
    console.error('❌ فشل في الاختبار:', error.message);
    console.error(error.stack);
  }
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default runTests;
