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

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
      جميع الحقوق محفوظة لـ حمد عارف المران &nbsp;|&nbsp; ساهم في تطوير الموقع المطور : محمد الرميحي
    </Typography>
  );
}

const keywords = [
  'القرآن الكريم', 'سور القرآن', 'آيات القرآن', 'بيانات القرآن', 'تجويد القرآن', 'صوت القرآن', 'توقيت التلاوة', 'قراءة القرآن',
  'Quran API', 'Quran Data', 'Quran Audio', 'Quran Verses', 'Quran Chapters', 'Quran Pages', 'Quran Recitation', 'Quran Timing'
];

export default function Footer() {
  const [email, setEmail] = React.useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:alromaihi2224@gmail.com?subject=رسالة من زائر الموقع&body=${encodeURIComponent(email)}`;
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
                اشترك معنا ليصلك كل جديد
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                أكتب ايميلك لتصلك التحديثات والأخبار الجديدة عن الموقع
              </Typography>
              <InputLabel htmlFor="email-newsletter" sx={{ color: 'var(--text-primary)', mb: 1 }}>البريد الإلكتروني</InputLabel>
              <form onSubmit={handleSend}>
                <Stack direction="row" spacing={1} useFlexGap>
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
                      width: '250px',
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
                    sx={{
                      flexShrink: 0,
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                      },
                    }}
                  >
                    Send
                  </Button>
                </Stack>
              </form>
            </Box>
          </Box>
          {/* روابط ومفاتيح */}
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
                color: 'var(--secondary-color)', // لون الخط من المتغيرات
                fontSize: 16,
                mb: 1,
              }}
            >
              روابط ومفاتيح
            </Typography>
            {keywords.slice(0, 6).map((word, idx) => (
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
              href="https://x.com/msr_99"
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
              href="https://quran-api-qklj.onrender.com/docs#/paths/~1surah/get"
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
