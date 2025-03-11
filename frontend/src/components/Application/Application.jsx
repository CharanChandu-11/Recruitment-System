import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { useForm } from "react-hook-form";
const Application = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  
  const [resumeName, setResumeName] = useState("");

  useEffect(() => {
    if (!isAuthorized || (user && user.role === "Employer")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  // Handle form submission
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    formData.append("jobId", id);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/application/post",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        } 
      );

      toast.success(response.data.message);
      reset();
      setResumeName("");
      navigateTo("/job/getall");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("resume", file); // Set file in form state
      setResumeName(file.name);
    }
  };

  return (
    <section className="application">
      <div className="container">
        <h3>Application Form</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Your Name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}

          {/* Email Field */}
          <label>Your Email</label>
          <input
            type="email"
            placeholder="Your Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          {/* Phone Field */}
          <label>Your Phone Number</label>
          <input
            type="number"
            placeholder="Your Phone Number"
            {...register("phone", {
              required: "Phone number is required",
              minLength: { value: 10, message: "Enter a valid phone number" },
            })}
          />
          {errors.phone && <p className="error">{errors.phone.message}</p>}

          {/* Address Field */}
          <label>Your Address</label>
          <input
            type="text"
            placeholder="Your Address"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && <p className="error">{errors.address.message}</p>}

          {/* Cover Letter Field */}
          <label>Cover Letter</label>
          <textarea
            placeholder="Cover Letter..."
            {...register("coverLetter", { required: "Cover letter is required" })}
          />
          {errors.coverLetter && <p className="error">{errors.coverLetter.message}</p>}

          {/* Resume Upload */}
          <div>
            <label>Select Resume</label>
            <input
              type="file"
              accept=".pdf, .jpg, .png"
              onChange={handleFileChange}
            />
            {resumeName && <p>Selected File: {resumeName}</p>}
            {errors.resume && <p className="error">{errors.resume.message}</p>}
          </div>

          <button type="submit">Send Application</button>
        </form>
      </div>
    </section>
  );
};

export default Application;