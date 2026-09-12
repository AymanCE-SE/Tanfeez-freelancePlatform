import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import ProjectMiniCard from "../cards/ProjectMiniCard";
import { getLatestProjectsAction } from "../../store/slices/projectSlice";
import { homeSliderSettings } from "./sliderSettings";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function LatestProjectsSlider() {
  const dispatch = useDispatch();
  const { latestProjects = [], isLoading } = useSelector((state) => state.projectSlice);

  useEffect(() => {
    dispatch(getLatestProjectsAction());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (!Array.isArray(latestProjects) || latestProjects.length === 0) return <div className="alert alert-info p-2 m-4 text-center">No recent projects found.</div>;

  return (
    <section className="latest-projects-slider home-latest-section">
      <div className="home-section-heading">
        <div className="home-section-heading-copy">
          <span className="home-eyebrow">Fresh opportunities</span>
          <h2>Latest projects</h2>
          <p className="home-section-subtitle">See the newest briefs ready for the right specialist.</p>
        </div>
        <span className="home-section-rule" />
      </div>
      <Slider {...homeSliderSettings}>
        {latestProjects.map((project) => (
          <ProjectMiniCard key={project.id} project={project} />
        ))}
      </Slider>
    </section>
  );
}