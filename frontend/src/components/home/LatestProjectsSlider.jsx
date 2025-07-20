import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import ProjectMiniCard from "../cards/ProjectMiniCard";
import { getLatestProjectsAction } from "../../store/slices/projectSlice";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function LatestProjectsSlider() {
  const dispatch = useDispatch();
  const { latestProjects = [], isLoading } = useSelector((state) => state.projectSlice);

  useEffect(() => {
    dispatch(getLatestProjectsAction());
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
  if (!Array.isArray(latestProjects) || latestProjects.length === 0) return <div>No recent projects found.</div>;

  return (
    <div className="latest-projects-slider py-4">
      <h2 className="mb-4 text-center">Latest Projects</h2>
      <Slider {...sliderSettings}>
        {latestProjects.map((project) => (
          <ProjectMiniCard key={project.id} project={project} />
        ))}
      </Slider>
    </div>
  );
}