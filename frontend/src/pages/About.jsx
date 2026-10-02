import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
  FiPackage,
  FiShield,
} from "react-icons/fi";
import "../styles/About.css";

const workPaths = [
  {
    audience: "For clients",
    title: "Post a project",
    description:
      "Share the scope, budget, and skills you need. Compare proposals and choose the freelancer who fits the work.",
    action: "Explore projects",
    href: "/projects",
    icon: FiBriefcase,
  },
  {
    audience: "For clients and freelancers",
    title: "Order a service",
    description:
      "Browse focused service listings, discuss the details directly, and keep the order conversation in one place.",
    action: "Browse services",
    href: "/services",
    icon: FiPackage,
  },
];

const workflow = [
  {
    number: "01",
    title: "Find the right fit",
    description: "Start with a project proposal or a listed service.",
    icon: FiBriefcase,
  },
  {
    number: "02",
    title: "Agree on the details",
    description: "Use a dedicated conversation to clarify scope and terms.",
    icon: FiMessageCircle,
  },
  {
    number: "03",
    title: "Finish and review",
    description: "Complete the engagement, then leave feedback based on the work.",
    icon: FiCheckCircle,
  },
];

const team = [
  { name: "Mohamed Hassan", image: "/logo/mhadad.jpeg" },
  { name: "Ayman Samir", image: "/logo/ayman.jpeg" },
  { name: "Saraa Talat Ali", image: "/logo/images%20(1).jpeg" },
  { name: "Mohamed Akram" },
  { name: "Mohamed Emad" },
  { name: "Mohamed Hosny" },
];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-shell about-hero-inner">
          <img
            className="about-brand-mark"
            src="/logo/tanfeez-avatar.svg?v=3"
            alt=""
            aria-hidden="true"
          />
          <p className="about-eyebrow">A freelance marketplace built around the work</p>
          <h1>Tanfeez</h1>
          <p className="about-hero-copy">
            Find a freelancer for your project, or discover a service ready to
            order. Tanfeez keeps proposals, conversations, and feedback connected
            from the first details to the finished work.
          </p>
          <div className="about-hero-actions">
            <Link className="about-button about-button-primary" to="/projects">
              Find a project <FiArrowRight aria-hidden="true" />
            </Link>
            <Link className="about-button about-button-secondary" to="/services">
              Explore services <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="about-shell about-paths-section">
        <div className="about-section-heading">
          <p className="about-eyebrow">Two ways to get started</p>
          <h2>Work that moves in the right direction.</h2>
        </div>
        <div className="about-path-grid">
          {workPaths.map(({ audience, title, description, action, href, icon: Icon }) => (
            <article className="about-path" key={title}>
              <div className="about-path-topline">
                <span className="about-path-icon"><Icon aria-hidden="true" /></span>
                <span className="about-path-audience">{audience}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link className="about-text-link" to={href}>
                {action} <FiArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="about-workflow">
        <div className="about-shell">
          <div className="about-section-heading about-section-heading-light">
            <p className="about-eyebrow">From first message to final review</p>
            <h2>A clearer path through freelance work.</h2>
          </div>
          <div className="about-workflow-grid">
            {workflow.map(({ number, title, description, icon: Icon }) => (
              <article className="about-step" key={number}>
                <div className="about-step-heading">
                  <span className="about-step-number">{number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-trust-section">
        <div className="about-shell about-trust-inner">
          <span className="about-trust-icon"><FiShield aria-hidden="true" /></span>
          <div>
            <p className="about-eyebrow">Feedback with context</p>
            <h2>Reviews are tied to real engagements.</h2>
            <p>
              Ratings follow completed projects and service orders, giving
              clients and freelancers a useful record of the work they did
              together.
            </p>
          </div>
        </div>
      </section>

      <section className="about-shell about-team-section">
        <div className="about-section-heading">
          <p className="about-eyebrow">The people behind Tanfeez</p>
          <h2>Built by a team that cares about better work.</h2>
        </div>
        <div className="about-team-grid">
          {team.map(({ name, image }) => (
            <article className="about-member" key={name}>
              {image ? (
                <img className="about-member-image" src={image} alt={name} />
              ) : (
                <span className="about-member-initials" aria-hidden="true">
                  {initials(name)}
                </span>
              )}
              <h3>{name}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
