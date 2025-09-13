/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/X';
import LanguageIcon from '@mui/icons-material/Language';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScrollToTop from './ScrollToTop';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';




function Copyright() {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      mt: 4,
      mb: 2,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#009d9d', 
          fontSize: { xs: '12px', sm: '14px', md: '16px' },
          lineHeight: { xs: 1.5, sm: 1.6, md: 1.8 },
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          mb: 3
        }}
      >
        اللهم أجعل هذا الموقع صدقه جاريه لي ولحمد المران ولاهل بيتنا ووالدينا وموتانا اللهم اغفر لهم ورحمهم ووفقنا لخدمة الدين
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'var(--text-primary)', 
          fontSize: { xs: '11px', sm: '12px', md: '14px' },
          lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
          fontWeight: 400,
          textAlign: 'center',
          letterSpacing: '0.3px',
          opacity: 0.8
        }}
      >
        الموقع هذا يعتبر مصدر مفتوح لنشر القرآن الكريم وبجوده
        <br />
        هذا الموقع مفتوح المصدر وويمكنك أستعمال الكود في حسابي في قت هاب
        <br />
        وقريبا سيتم أنشآء تطبيقين ios & android platforms
        <br />
        اللهم أني أبتغي وجهك فبارك لنا فيه
        <br />
        <strong style={{ color: 'var(--secondary-color)' }}>
          مطور الموقع: محمد الرميحي | Msr7799
        </strong>
      </Typography>
    </Box>
  );
}

const keywords = [
  'القرآن الكريم', 'سور القرآن', 'آيات القرآن', 'بيانات القرآن', 'تجويد القرآن', 'صوت القرآن', 'توقيت التلاوة', 'قراءة القرآن',
  'Quran API', 'Quran Data', 'Quran Audio', 'Quran Verses', 'Quran Chapters', 'Quran Pages', 'Quran Recitation', 'Quran Timing'
];

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState<'success' | 'error' | ''>('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('يرجى إدخال بريد إلكتروني صحيح');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage('✅ تم الاشتراك بنجاح! تفقد بريدك الإلكتروني');
        setMessageType('success');
        setEmail(''); // مسح الإيميل بعد النجاح
      } else {
        setMessage(data.message || 'حدث خطأ أثناء الاشتراك');
        setMessageType('error');
      }
    } catch (error) {
      console.error('خطأ في الاشتراك:', error);
      setMessage('حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Divider sx={{ borderColor: 'var(--border-color)' }} />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 4, sm: 8 },
          py: { xs: 8, sm: 10 },
          textAlign: { sm: 'center', md: 'left' },
          backgroundColor: 'var(--background-color)',
          color: 'var(--text-primary)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: { xs: '100%', sm: '60%' },
            }}
          >
            <Box sx={{ width: { xs: '70%', sm: '60%' } }}>
              <img
                src="./logo.png"
                alt="Quran Logo"
                style={{
                  width: "100px",
                  height: "100px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  backgroundColor: "var(--background-paper)"
                }}
              />
              <Typography
                variant="body2"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2, color: 'var(--text-primary)' }}
              >
                📿 اشترك في الحديث اليومي
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                احصل على حديث شريف يومياً من صحيح البخاري أو مسلم في بريدك الإلكتروني
              </Typography>
              <InputLabel htmlFor="email-newsletter" sx={{ color: 'var(--text-primary)', mb: 1 }}>البريد الإلكتروني</InputLabel>
              <form onSubmit={handleSend}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 2, sm: 1 }} 
                  useFlexGap
                  sx={{ width: '100%' }}
                >
                  <TextField
                    id="email-newsletter"
                    hiddenLabel
                    size="small"
                    variant="outlined"
                    fullWidth
                    aria-label="Enter your email address"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    slotProps={{
                      htmlInput: {
                        autoComplete: 'off',
                        'aria-label': 'Enter your email address',
                      },
                    }}
                    sx={{
                      width: { xs: '100%', sm: '250px' },
                      '& .MuiOutlinedInput-root': {
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--background-paper)',
                        '& fieldset': {
                          borderColor: 'var(--border-color)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--primary-color)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--primary-color)',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'var(--text-muted)',
                        opacity: 1,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={isLoading}
                    sx={{
                      flexShrink: 0,
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      minWidth: { xs: '100%', sm: '80px' },
                      height: { xs: '45px', sm: 'auto' },
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                      },
                      '&:disabled': {
                        backgroundColor: 'var(--primary-color)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : 'اشترك'}
                  </Button>
                </Stack>
              </form>
              
              {/* رسائل الحالة */}
              {message && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: messageType === 'success' 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'rgba(244, 67, 54, 0.1)',
                    border: `1px solid ${messageType === 'success' 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : 'rgba(244, 67, 54, 0.3)'}`,
                  }}
                >
                  {messageType === 'success' ? (
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  ) : (
                    <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: messageType === 'success' ? '#4caf50' : '#f44336',
                      fontWeight: 500,
                    }}
                  >
                    {message}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          {/* روابط ومفاتيح */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 3, sm: 0 }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: 'var(--secondary-color)', // لون الخط من المتغيرات
                fontSize: 16,
                mb: 1,
              }}
            >
              روابط ومفاتيح
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 0.5, sm: 0.3 },
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {keywords.slice(0, 6).map((word, idx) => (
                <Box
                  key={idx}
                  sx={{
                    border: '1px solid var(--secondary-color)',
                    color: 'var(--secondary-color)',
                    borderRadius: '20px',
                    px: { xs: 1, sm: 1.5 },
                    py: 0.2,
                    fontSize: { xs: 10, sm: 12 },
                    background: 'transparent',
                    textAlign: 'center',
                    width: 'fit-content',
                    transition: 'all 0.3s ease',
                    display: { xs: idx < 4 ? 'block' : 'none', sm: 'block' },
                    '&:hover': {
                      backgroundColor: 'var(--secondary-color)',
                      color: 'white',
                    }
                  }}
                >
                  {word}
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: 'var(--secondary-color)',
                fontSize: 16,
                mb: 1,
              }}
            >
              روابط ومفاتيح
            </Typography>
            {keywords.slice(6, 12).map((word, idx) => (
              <Box
                key={idx}
                sx={{
                  border: '1px solid var(--secondary-color)',
                  color: 'var(--secondary-color)',
                  borderRadius: '20px',
                  px: 1.5,
                  py: 0.2,
                  fontSize: 12,
                  m: 0.3,
                  background: 'transparent',
                  textAlign: 'center',
                  width: 'fit-content',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                  }
                }}
              >
                {word}
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: 'var(--secondary-color)',
                fontSize: 16,
                mb: 1,
              }}
            >
              روابط ومفاتيح
            </Typography>
            {keywords.slice(12, 18).map((word, idx) => (
              <Box
                key={idx}
                sx={{
                  border: '1px solid var(--secondary-color)',
                  color: 'var(--secondary-color)',
                  borderRadius: '20px',
                  px: 1.5,
                  py: 0.2,
                  fontSize: 12,
                  m: 0.3,
                  background: 'transparent',
                  textAlign: 'center',
                  width: 'fit-content',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                  }
                }}
              >
                {word}
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: { xs: 4, sm: 8 },
            width: '100%',
            borderTop: '1px solid',
            borderColor: 'var(--border-color)',
            mb: 3,
          }}
        >
          <div>
            <Copyright />
          </div>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: 'left', color: 'var(--text-secondary)' }}
          >
            <IconButton
              color="inherit"
              size="small"
              href="https://github.com/Msr7799"
              aria-label="GitHub"
              sx={{
                alignSelf: 'center',
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--primary-color)',
                  backgroundColor: 'rgba(52, 73, 94, 0.1)',
                }
              }}
              target="_blank"
              rel="noopener"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://x.com"
              aria-label="X"
              sx={{
                alignSelf: 'center',
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--primary-color)',
                  backgroundColor: 'rgba(52, 73, 94, 0.1)',
                }
              }}
              target="_blank"
              rel="noopener"
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://msr-quran-data.vercel.app/"
              aria-label="Website"
              sx={{
                alignSelf: 'center',
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--primary-color)',
                  backgroundColor: 'rgba(52, 73, 94, 0.1)',
                }
              }}
              target="_blank"
              rel="noopener"
            >
              <LanguageIcon />
            </IconButton>
          </Stack>
        </Box>
      </Container>

      {/* مكون العودة لأعلى الصفحة */}
      <ScrollToTop
        showAfter={400}
        behavior="smooth"
        position="bottom-right"
        size="medium"
        variant="primary"
        ariaLabel="العودة إلى أعلى الصفحة"
      />
    </React.Fragment>
  );
}
