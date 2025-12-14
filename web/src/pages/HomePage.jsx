import Layout from "./../components/layouts/Layout";
import Footer from "../components/footer/Footer";
import { Hero } from "../components/hero/Hero";
import { RecentWork } from "../components/recent-work/RecentWork";

function HomePage() {
  return (
    <Layout>
      <section className="">
        <Hero />
      </section>
     
      <section>
        <RecentWork />
      </section>

      <section>
        {/* <LoginBanner /> */}
      </section>

      <Footer />

      
    </Layout>
  );
}

export default HomePage;
