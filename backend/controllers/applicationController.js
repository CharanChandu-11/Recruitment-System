import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// ✅ Job Seeker submits an application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role === "Employer") {
    return next(new ErrorHandler("Employers cannot apply for jobs.", 400));
  }

  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Resume file is required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

  if (!allowedFormats.includes(resume.mimetype)) {
    return next(new ErrorHandler("Invalid file type. Upload a PDF or image.", 400));
  }

  if (!resume.tempFilePath) {
    return next(new ErrorHandler("File upload error. Try again.", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, {
    resource_type: "auto",
  });

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  if (!name || !email || !coverLetter || !phone || !address || !jobId) {
    return next(new ErrorHandler("Please fill all required fields.", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const applicantID = { user: req.user._id, role: "Job Seeker" };
  const employerID = { user: jobDetails.postedBy, role: "Employer" };

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted Successfully!",
    application,
  });
});

// ✅ Employer gets all applications
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role !== "Employer") {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  const applications = await Application.find({ "employerID.user": req.user._id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// ✅ Job Seeker gets all applications (FIXED)
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role !== "Job Seeker") {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  const applications = await Application.find({ "applicantID.user": req.user._id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// ✅ Job Seeker deletes an application
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role !== "Job Seeker") {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  const application = await Application.findOneAndDelete({
    _id: req.params.id,
    "applicantID.user": req.user._id,
  });

  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Application deleted successfully.",
  });
});
