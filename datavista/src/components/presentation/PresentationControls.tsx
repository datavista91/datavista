import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  SkipBack, 
  SkipForward,
  Settings,
  Palette,
  Download,
  Share2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Slide } from './SlideRenderer';

interface PresentationControlsProps {
  slides: Slide[];
  currentSlide: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  theme: string;
  themes: string[];
  onSlideChange: (index: number) => void;
  onPlayToggle: () => void;
  onFullscreenToggle: () => void;
  onThemeChange: (theme: string) => void;
  onExport: (format: 'pdf' | 'pptx') => void;
  onShare: () => void;
}

const PresentationControls: React.FC<PresentationControlsProps> = ({
  slides,
  currentSlide,
  isPlaying,
  isFullscreen,
  theme,
  themes,
  onSlideChange,
  onPlayToggle,
  onFullscreenToggle,
  onThemeChange,
  onExport,
  onShare
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          if (currentSlide < slides.length - 1) {
            onSlideChange(currentSlide + 1);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (currentSlide > 0) {
            onSlideChange(currentSlide - 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          onSlideChange(0);
          break;
        case 'End':
          event.preventDefault();
          onSlideChange(slides.length - 1);
          break;
        case 'f':
        case 'F11':
          event.preventDefault();
          onFullscreenToggle();
          break;
        case 'p':
          event.preventDefault();
          onPlayToggle();
          break;        case 'Escape':
          if (isFullscreen) {
            onFullscreenToggle();
          }
          break;
        case 'c':
        case 'C':
          event.preventDefault();
          setControlsVisible(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, onSlideChange, onFullscreenToggle, onPlayToggle, isFullscreen]);
  const progress = slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0;

  return (
    <>
      {/* Collapse/Expand Toggle Button - Always Visible */}
      <div className="controls-toggle">
        <button
          onClick={() => setControlsVisible(!controlsVisible)}
          className="toggle-btn"
          title={controlsVisible ? "Hide controls (C)" : "Show controls (C)"}
        >
          {controlsVisible ? 
            <ChevronDown className="w-5 h-5" /> : 
            <ChevronUp className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Main Controls Panel */}
      <div className={`presentation-controls ${isFullscreen ? 'fullscreen-controls' : ''} ${controlsVisible ? 'controls-visible' : 'controls-hidden'}`}>
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Main Controls */}
      <div className="controls-main">
        {/* Navigation */}
        <div className="nav-controls">
          <button
            onClick={() => onSlideChange(0)}
            disabled={currentSlide === 0}
            className="control-btn"
            title="First slide (Home)"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="control-btn"
            title="Previous slide (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onPlayToggle}
            className="control-btn play-btn"
            title={isPlaying ? "Pause (P)" : "Play (P)"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="control-btn"
            title="Next slide (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSlideChange(slides.length - 1)}
            disabled={currentSlide === slides.length - 1}
            className="control-btn"
            title="Last slide (End)"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => onSlideChange(index)}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Secondary Controls */}
        <div className="secondary-controls">
          {/* Theme Selector */}
          <div className="control-dropdown">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="control-btn"
              title="Change theme"
            >
              <Palette className="w-5 h-5" />
            </button>
            {showThemes && (
              <div className="dropdown-menu themes-menu">
                {themes.map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => {
                      onThemeChange(themeName);
                      setShowThemes(false);
                    }}
                    className={`dropdown-item ${theme === themeName ? 'active' : ''}`}
                  >
                    <div className={`theme-preview theme-${themeName}`} />
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Menu */}
          <div className="control-dropdown">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="control-btn"
              title="Export presentation"
            >
              <Download className="w-5 h-5" />
            </button>
            {showExportMenu && (
              <div className="dropdown-menu export-menu">
                <button
                  onClick={() => {
                    onExport('pdf');
                    setShowExportMenu(false);
                  }}
                  className="dropdown-item"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    onExport('pptx');
                    setShowExportMenu(false);
                  }}
                  className="dropdown-item"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PPTX
                </button>
              </div>
            )}
          </div>

          {/* Share */}
          <button
            onClick={onShare}
            className="control-btn"
            title="Share presentation"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="control-btn"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreenToggle}
            className="control-btn"
            title={isFullscreen ? "Exit fullscreen (F/Esc)" : "Fullscreen (F)"}
          >
            {isFullscreen ? 
              <Minimize2 className="w-5 h-5" /> : 
              <Maximize2 className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Presentation Settings</h3>
          <div className="settings-content">
            <div className="setting-item">
              <label>Auto-advance interval</label>
              <select defaultValue="5000">
                <option value="2000">2 seconds</option>
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
                <option value="15000">15 seconds</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Transition effect</label>
              <select defaultValue="slide">
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </div>
        </div>
      )}      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">        <div className="shortcuts-title">Keyboard Shortcuts:</div>
        <div className="shortcuts-list">
          <span>← → Navigate</span>
          <span>Space Next</span>
          <span>Home/End First/Last</span>
          <span>F Fullscreen</span>
          <span>P Play/Pause</span>
          <span>C Hide/Show</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default PresentationControls;
