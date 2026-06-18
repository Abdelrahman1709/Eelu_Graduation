import maleIcon from "../assets/Gender/men.avif";
import femaleIcon from "../assets/Gender/woman.avif";

const GenderSelectionPanel = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  setValue,
  genderSelected,
  setGenderSelected,
  loading,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <p className="text-sm text-gray-300">
        Choose your gender to complete account creation.
      </p>
      <input
        type="hidden"
        {...register("gender", { required: "Please choose your gender" })}
      />

      <div className="grid gap-3 grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setValue("gender", "male");
            setGenderSelected("male");
          }}
          className={`rounded-3xl border p-3 flex flex-col items-center gap-3 text-center transition ${
            genderSelected === "male"
              ? "border-[#8b5cf6] bg-white/10 shadow-2xl"
              : "border-white/10 bg-white/5 hover:border-[#8b5cf6] hover:bg-white/10"
          }`}
        >
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black/30 p-4">
            <img src={maleIcon} alt="Male" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <span className="text-white text-lg font-semibold">Male</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setValue("gender", "female");
            setGenderSelected("female");
          }}
          className={`rounded-3xl border p-3 flex flex-col items-center gap-3 text-center transition ${
            genderSelected === "female"
              ? "border-[#8b5cf6] bg-white/10 shadow-2xl"
              : "border-white/10 bg-white/5 hover:border-[#8b5cf6] hover:bg-white/10"
          }`}
        >
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black/30 p-4">
            <img src={femaleIcon} alt="Female" className="max-h-full max-w-full object-contain rounded-full" />
          </div>
          <div>
            <span className="text-white text-lg font-semibold">Female</span>
          </div>
        </button>
      </div>

      {errors.gender && (
        <p className="text-red-400 text-sm">{errors.gender.message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Complete Sign Up"}
      </button>
    </form>
  );
};

export default GenderSelectionPanel;
