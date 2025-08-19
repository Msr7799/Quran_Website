// pages/about.jsx
import SeoHead from '../components/SeoHead';
import styles from '../styles/About.module.css';
import { FaInfoCircle, FaHome, FaEnvelope } from 'react-icons/fa';

export default function About() {
  return (
    <>
      <SeoHead
        title="من نحن - موقع القرآن الكريم"
        description="تعرف على موقع القرآن الكريم ورؤيته لتقديم محتوى متكامل للقرآن الكريم."
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/about`}
        image={`${process.env.NEXT_PUBLIC_BASE_URL}/images/about-image.jpg`}
        keywords="موقع القرآن الكريم, معلومات عنا, رؤية الموقع"
      />
      <main className={styles.container}>
        <section className={styles.section}>
          <h1 className={styles.title}><FaHome className={styles.titleIcon} title='من نحن' aria-label='من نحن' /> من نحن</h1>
          <p className={styles.paragraph} title='بحمد الله وتوفيقه نقدم موقع القرآن الكريم' aria-label='بحمد الله وتوفيقه نقدم موقع القرآن الكريم'>
            بحمد الله وتوفيقه، نقدم موقع القرآن الكريم الذي يهدف إلى تقديم محتوى شامل ومتقدم يخص كتاب الله العزيز، 
            بما في ذلك فهرس القرآن وملفات PDF و MP3 وصفحات للقراء. نسأل الله العلي العظيم أن يجعل هذا العمل 
            في ميزان حسنات عبدالله الرميحي وأهل بيته، وأن ينفع به المسلمين في كل مكان.
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.title}><FaInfoCircle className={styles.titleIcon} title='رؤيتنا' aria-label='رؤيتنا' /> رؤيتنا</h2>
          <p className={styles.paragraph}>
            بإذن الله تعالى، نسعى من خلال هذا الموقع إلى تقديم محتوى دقيق وموثوق من كتاب الله العزيز يتماشى مع احتياجات 
            المستخدمين في استكشاف وتعلم القرآن الكريم. نحن ملتزمون بفضل الله ومنّته بتوفير تجربة مريحة وسلسة لمساعدة 
            إخواننا المسلمين على الوصول إلى الموارد القرآنية بسهولة ويسر. نسأل الله تبارك وتعالى أن يبارك في هذا العمل 
            وأن يجعله صدقة جارية لعبدالله الرميحي وأهل بيته وأن ينفع به الأمة الإسلامية جمعاء.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}><FaEnvelope className={styles.titleIcon} title='معلومات المطور' aria-label='معلومات المطور' /> المطور</h2>
          <div style={{ marginBottom: 16 }}>
            <img
              src="/quran_data_website.gif"
              alt="Quran Data Website"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
              title='معلومات عن المطور'
              aria-label='معلومات عن المطور'
            />
          </div>
          <p className={styles.paragraph}>
            هذا الموقع تم تطويره كجزء من مشروع لتقديم محتوى القرآن الكريم بشكل متكامل وسهل الاستخدام.
            نحن نؤمن بأهمية توفير موارد تعليمية ودينية عالية الجودة للمستخدمين.
          </p>
          <p className={styles.paragraph}>
            للمزيد من المعلومات أو للاستفسارات، لا تتردد في <a href="mailto:rn0x.me@gmail.com" className={styles.link} title='تواصل عبر البريد الإلكتروني' aria-label='تواصل عبر البريد الإلكتروني'>التواصل معنا</a>.
          </p>
        </section>


      </main>
    </>
  );
}