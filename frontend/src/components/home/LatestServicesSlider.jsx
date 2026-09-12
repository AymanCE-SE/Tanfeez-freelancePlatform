import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import ServiceMiniCard from "../cards/ServiceMiniCard";
import { getLatestServicesAction } from "../../store/slices/serviceSlice";
import { homeSliderSettings } from "./sliderSettings";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function LatestServicesSlider() {
  const dispatch = useDispatch();
  const { latestServices = [], isLoading } = useSelector((state) => state.serviceSlice);

  useEffect(() => {
    dispatch(getLatestServicesAction());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (!Array.isArray(latestServices) || latestServices.length === 0) return <div className="alert alert-info p-2 m-4 text-center">No recent services found.</div>;

  return (
    <section className="latest-services-slider home-latest-section">
      <div className="home-section-heading">
        <div className="home-section-heading-copy">
          <span className="home-eyebrow">Ready to start</span>
          <h2>Latest services</h2>
          <p className="home-section-subtitle">Browse fresh offers from independent professionals.</p>
        </div>
        <span className="home-section-rule" />
      </div>
      <Slider {...homeSliderSettings}>
        {latestServices.map((service) => (
          <ServiceMiniCard key={service.id} service={service} />
        ))}
      </Slider>
    </section>
  );
}