import React from 'react';
import { HomeHero } from '../components/HomeHero';
import { HomeCategory } from '../components/HomeCategory';
import { LatestProjectsSlider } from '../components/home/LatestProjectsSlider';
import { LatestServicesSlider } from '../components/home/LatestServicesSlider';

export function Home() {
  return (
    <>
      <HomeHero />
      <LatestProjectsSlider />
      <HomeCategory />
      <LatestServicesSlider />
    </>
  );
}
