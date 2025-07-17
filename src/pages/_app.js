import '../styles/globals.css';
import AppTheme from '../theme/AppTheme';
import { Box, CssBaseline } from '@mui/material';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import Layout from '../components/Layout';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1976d2" />
      </Head>
      <Box className="siteWrapper">
        <AppTheme>
          <CssBaseline />
          <AppAppBar />
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Layout>
            <Footer />
          </Layout>
        </AppTheme>
      </Box>
    </>
  );
}
