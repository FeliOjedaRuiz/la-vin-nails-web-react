import Layout from './../components/layouts/Layout';
import Footer from '../components/footer/Footer';
import { Hero } from '../components/hero/Hero';
import { RecentWork } from '../components/recent-work/RecentWork';
import { ServicesHome } from '../components/services/services-home/ServicesHome';
import SEO from '../components/seo/SEO';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';

function HomePage() {
	return (
		<Layout>
			<SEO 
				title="Manicura y Pedicura Profesional en Granada" 
				description="Especialistas en uñas esculpidas, semipermanente y nail art en Granada. Calidad, higiene y diseños personalizados en La Vin Nails."
			/>
      <LocalBusinessSchema />
			<section className="">
				<Hero />
			</section>

			<section>
				<ServicesHome />
			</section>

			<section>
				<RecentWork />
			</section>

			<section>{/* <LoginBanner /> */}</section>

			<Footer />
		</Layout>
	);
}

export default HomePage;
