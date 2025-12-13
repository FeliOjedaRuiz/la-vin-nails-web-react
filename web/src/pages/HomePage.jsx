import LaVinLogo from "../images/la-vin-nails-logo.webp";
import Layout from "./../components/layouts/Layout";
import ServicesSlide from "../components/services/services-slide/ServicesSlide";
import LoginBanner from "../components/login-banner/LoginBanner";
import InstagramIcon from "../components/icons/InstagramIcon";
import WhatsappIcon2 from "../components/icons/WhatsappIcon2";
import { ResponsiveCarousel } from "../components/home-carousel/ResponsiveCarousel";
import Footer from "../components/footer/Footer";
import { Hero } from "../components/hero/Hero";

function HomePage() {
  return (
    <Layout>
      <section className="">
        <Hero />
      </section>
     
      <section>
        {/* <ServicesSlide /> */}
      </section>

      <section>
        {/* <LoginBanner /> */}
      </section>

      <Footer />

      
    </Layout>
  );
}

export default HomePage;
