import { Suspense } from "react";

import AboutUs from "./features/home/AboutUs";
import Banner from "./features/home/Banner";
import FAQ from "./features/home/FAQ";
import Media from "./features/home/media";
import SubscriptionPlan from "./features/home/subscriptionPlan";




export default function Home() {
  return (
  <div>
  <Banner></Banner>
  <Suspense
    fallback={
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold tracking-tight">Explore titles</h2>
          <p className="mt-4 text-sm text-muted-foreground">Loading titles...</p>
        </div>
      </section>
    }
  >
    <Media />
  </Suspense>
  <AboutUs></AboutUs>
  <SubscriptionPlan></SubscriptionPlan>
  <FAQ></FAQ>
  </div>

  );
}
