import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container">
      <div class="logo-circle">
        <!-- Modern gradient background -->
        <div class="bg-gradient"></div>

        <!-- Simplified chart icon -->
        <div class="chart-icon">
          <svg viewBox="0 0 24 24" class="chart-svg">
            <path
              d="M3 13h4v8H3zm6-5h4v13H9zm6-4h4v17h-4z"
              fill="currentColor"
            />
            <circle cx="20" cy="4" r="2" fill="#10b981" />
          </svg>
        </div>

        <!-- Modern sparkle effects -->
        <div class="sparkle sparkle-1"></div>
        <div class="sparkle sparkle-2"></div>
      </div>

      <div class="logo-text">
        <span class="brand-name">Creative Budget</span>
        <span class="brand-tagline">Smart Finance</span>
      </div>
    </div>
  `,
  styles: [
    `
      .logo-container {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 8px;
      }

      .logo-container:hover {
        transform: translateY(-2px);
      }

      .logo-circle {
        position: relative;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: linear-gradient(
          135deg,
          #6366f1 0%,
          #8b5cf6 50%,
          #a855f7 100%
        );
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3),
          0 1px 0 rgba(255, 255, 255, 0.2) inset;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: modernGlow 3s ease-in-out infinite;
      }

      @keyframes modernGlow {
        0%,
        100% {
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3),
            0 1px 0 rgba(255, 255, 255, 0.2) inset;
        }
        50% {
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.4),
            0 1px 0 rgba(255, 255, 255, 0.3) inset;
        }
      }

      .bg-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at 30% 30%,
          rgba(255, 255, 255, 0.2) 0%,
          transparent 50%
        );
      }

      .chart-icon {
        position: relative;
        z-index: 2;
        color: white;
        width: 24px;
        height: 24px;
      }

      .chart-svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      }

      .sparkle {
        position: absolute;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: sparkleAnimation 2s infinite;
      }

      .sparkle-1 {
        width: 4px;
        height: 4px;
        top: 8px;
        right: 8px;
        animation-delay: 0s;
      }

      .sparkle-2 {
        width: 3px;
        height: 3px;
        bottom: 12px;
        left: 10px;
        animation-delay: 1s;
      }

      @keyframes sparkleAnimation {
        0%,
        100% {
          opacity: 0;
          transform: scale(0);
        }
        50% {
          opacity: 1;
          transform: scale(1);
        }
      }

      .logo-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 8px;
        text-align: center;
      }

      .brand-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .brand-tagline {
        font-size: 10px;
        font-weight: 500;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
      }

      /* Dark mode support */
      .dark-mode .brand-tagline {
        color: #9ca3af;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .logo-circle {
          width: 48px;
          height: 48px;
        }

        .chart-icon {
          width: 20px;
          height: 20px;
        }

        .brand-name {
          font-size: 14px;
        }

        .brand-tagline {
          font-size: 9px;
        }
      }
    `,
  ],
})
export class LogoComponent {}
