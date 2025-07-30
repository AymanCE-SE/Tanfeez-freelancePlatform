import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import ServiceMiniCard from "../cards/ServiceMiniCard";
import { getLatestServicesAction } from "../../store/slices/serviceSlice";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function LatestServicesSlider() {
  const dispatch = useDispatch();
  const { latestServices = [], isLoading } = useSelector((state) => state.serviceSlice);

  useEffect(() => {
    dispatch(getLatestServicesAction());
  }, [dispatch]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  if (isLoading) return <div>Loading...</div>;
  if (!Array.isArray(latestServices) || latestServices.length === 0) return <div className="alert alert-info p-2 m-4 text-center">No recent services found.</div>;

  return (
    <div className="latest-services-slider py-4">
      <h2 className="mb-4 text-center">Latest Services</h2>
      <Slider {...sliderSettings}>
        {latestServices.map((service) => (
          <ServiceMiniCard key={service.id} service={service} />
        ))}
      </Slider>
    </div>
  );
}