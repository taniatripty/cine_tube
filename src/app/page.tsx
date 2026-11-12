import AboutUs from "./features/home/AboutUs";
import Banner from "./features/home/Banner";
import FAQ from "./features/home/FAQ";
import SubscriptionPlan from "./features/home/subscriptionPlan";




export default function Home() {
  return (
  <div>
  <Banner></Banner>
  <AboutUs></AboutUs>
  <SubscriptionPlan></SubscriptionPlan>
  <FAQ></FAQ>
  </div>

  );
}
