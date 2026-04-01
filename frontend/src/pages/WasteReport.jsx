import React, { useState } from "react";
import {
  Camera,
  MapPin,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  ArrowRight,
  Send,
  RotateCw,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { wasteService } from "../api/services";

// Animation wrapper
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// Step indicator component
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, title: "Details" },
    { num: 2, title: "Photo" },
    { num: 3, title: "Location" },
  ];

  return (
    <div className="flex items-center justify-between max-w-sm mx-auto mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                currentStep === step.num
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-110"
                  : currentStep > step.num
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                step.num
              )}
            </div>
            <p
              className={`mt-2 text-sm font-semibold ${
                currentStep >= step.num
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                currentStep > step.num
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Success screen
const SuccessScreen = ({ onReset, onNavigate, points }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-green-100 dark:bg-green-900 rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Report Submitted!
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
        You've earned{" "}
        <span className="font-bold text-green-600">
          +{points || 0} eco points!
        </span>
      </p>

      <div className="space-y-3">
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
        >
          <RotateCw className="w-5 h-5 inline mr-2" />
          Report More Waste
        </button>
        <button
          onClick={onNavigate}
          className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <Eye className="w-5 h-5 inline mr-2" />
          View My Reports
        </button>
      </div>
    </div>
  </div>
);

const WasteReportPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    wasteType: "",
    quantity: "",
    description: "",
    location: null,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(null);

  const wasteTypes = [
    {
      value: "plastic",
      label: "Plastic",
      icon: "🥤",
      color: "bg-blue-100 border-blue-500",
    },
    {
      value: "organic",
      label: "Organic",
      icon: "🌿",
      color: "bg-green-100 border-green-500",
    },
    {
      value: "e-waste",
      label: "E-Waste",
      icon: "📱",
      color: "bg-purple-100 border-purple-500",
    },
    {
      value: "metal",
      label: "Metal",
      icon: "🔧",
      color: "bg-gray-100 border-gray-500",
    },
    {
      value: "glass",
      label: "Glass",
      icon: "🍾",
      color: "bg-cyan-100 border-cyan-500",
    },
    {
      value: "paper",
      label: "Paper",
      icon: "📄",
      color: "bg-yellow-100 border-yellow-500",
    },
    {
      value: "mixed",
      label: "Mixed",
      icon: "♻️",
      color: "bg-orange-100 border-orange-500",
    },
    {
      value: "hazardous",
      label: "Hazardous",
      icon: "⚠️",
      color: "bg-red-100 border-red-500",
    },
  ];

  const quantities = [
    { value: "small", label: "Small", desc: "Fits in a bag", points: "+10" },
    { value: "medium", label: "Medium", desc: "Wheelbarrow", points: "+20" },
    { value: "large", label: "Large", desc: "Truck load", points: "+30" },
  ];

  /* --------------------------- FIXED IMAGE UPLOAD --------------------------- */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5),
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* --------------------------- FIXED LOCATION HANDLER --------------------------- */
  const getCurrentLocation = () => {
    setUploading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setUploading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = Number(position.coords.longitude);
        const lat = Number(position.coords.latitude);

        setFormData((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [lng, lat], // ✔ Now numbers, not strings
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          },
        }));
        setUploading(false);
      },
      () => {
        setError("Unable to get location. Enable location services.");
        setUploading(false);
      }
    );
  };

  /* --------------------------- FIXED SUBMIT HANDLER --------------------------- */
  const handleSubmit = async () => {
    if (!formData.location || !formData.wasteType || !formData.quantity) {
      setError("Please complete all required fields.");
      return;
    }

    setUploading(true);
    setError(null);

    const reportData = new FormData();
    reportData.append("wasteType", formData.wasteType);
    reportData.append("quantity", formData.quantity);
    reportData.append("description", formData.description || "");

    // ⭐ FIXED: Coordinates now sent as numbers
    reportData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [
          Number(formData.location.coordinates[0]),
          Number(formData.location.coordinates[1]),
        ],
        address: formData.location.address || "",
      })
    );

    // Append images
    formData.images.forEach((img) => reportData.append("images", img.file));

    try {
      const response = await wasteService.createReport(reportData);
      setEarnedPoints(response.data?.ecoPointsAwarded || 0);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Report submission failed.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setStep(1);
    setFormData({
      wasteType: "",
      quantity: "",
      description: "",
      location: null,
      images: [],
    });
    setEarnedPoints(null);
    setError(null);
  };

  /* --------------------------- SUCCESS SCREEN --------------------------- */
  if (success) {
    return (
      <SuccessScreen
        points={earnedPoints}
        onReset={resetForm}
        onNavigate={() => navigate("/app/reports")}
      />
    );
  }

  /* --------------------------- UI (unchanged) --------------------------- */
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <AnimatedBlock delay={0} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <Trash2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report Waste
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help keep our city clean and earn eco points
          </p>
        </AnimatedBlock>

        <AnimatedBlock delay={100}>
          <StepIndicator currentStep={step} />
        </AnimatedBlock>

        <AnimatedBlock
          delay={200}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* STEPS UI - (UNCHANGED) */}
          {/* Everything below is UI only, original code preserved */}

          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                1. What type of waste?
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wasteTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData({ ...formData, wasteType: type.value })
                    }
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.wasteType === type.value
                        ? `${type.color} border-opacity-100 shadow-lg scale-105`
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md"
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                2. How much waste?
              </h3>

              <div className="space-y-3">
                {quantities.map((qty) => (
                  <button
                    key={qty.value}
                    onClick={() =>
                      setFormData({ ...formData, quantity: qty.value })
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.quantity === qty.value
                        ? "bg-blue-50 dark:bg-blue-900 border-blue-500 shadow-lg"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {qty.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {qty.desc}
                        </div>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {qty.points}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.wasteType || !formData.quantity}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                Next: Upload Photos <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                3. Upload Photos
              </h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Click to upload photos
                  </p>
                  <p className="text-sm text-gray-500">Up to 5 images</p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  4. Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.images.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                >
                  Next: Location <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                5. Waste Location
              </h3>

              <button
                onClick={getCurrentLocation}
                disabled={uploading}
                className={`w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition text-center ${
                  formData.location ? "border-green-500" : ""
                }`}
              >
                <MapPin
                  className={`w-12 h-12 mx-auto mb-3 ${
                    formData.location ? "text-green-500" : "text-blue-500"
                  }`}
                />
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {uploading
                    ? "Getting location..."
                    : formData.location
                      ? "Location Acquired!"
                      : "Use Current Location"}
                </p>
                {formData.location && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    📍 {formData.location.address}
                  </p>
                )}
              </button>

              {formData.location && (
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 sm:h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Map Preview
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.location || uploading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Report <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default WasteReportPage;
