function PredictionForm({
  availableSymptoms,
  loading,
  mode,
  symptomText,
  symptoms,
  textInput,
  onAddSymptom,
  onModeChange,
  onRemoveSymptom,
  onSubmitSymptoms,
  onSubmitText,
  onSymptomTextChange,
  onTextInputChange,
}) {
  const addTypedSymptoms = () => {
    symptomText
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => onAddSymptom(token));

    onSymptomTextChange("");
  };

  return (
    <div className="space-y-6">

      {/* Mode Switch */}
      <div className="flex gap-3">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === "symptoms"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => onModeChange("symptoms")}
          type="button"
        >
          Symptom Picker
        </button>

        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === "text"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => onModeChange("text")}
          type="button"
        >
          Natural Language
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {mode === "symptoms"
            ? "Select Symptoms"
            : "Describe in Plain English"}
        </h2>

        {/* ================= SYMPTOM MODE ================= */}
        {mode === "symptoms" ? (
          <>
            <p className="text-gray-600 mb-4">
              Tap symptoms or type your own below
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-3 mb-4">
              {availableSymptoms.slice(0, 24).map((symptom) => {
                const isSelected = symptoms.includes(symptom.toLowerCase());

                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => onAddSymptom(symptom)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {symptom.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add symptoms (comma separated)"
                value={symptomText}
                onChange={(e) => onSymptomTextChange(e.target.value)}
              />

              <button
                type="button"
                onClick={addTypedSymptoms}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Add
              </button>
            </div>

            {/* Selected */}
            <div className="flex flex-wrap gap-2 mb-4">
              {symptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500 text-white text-sm"
                >
                  {symptom.replace(/_/g, " ")}
                  <button
                    onClick={() => onRemoveSymptom(symptom)}
                    className="text-white hover:text-red-200"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Submit */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitSymptoms();
              }}
            >
              <button
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? "Analyzing..." : "Predict from Symptoms"}
              </button>
            </form>
          </>
        ) : (
          /* ================= TEXT MODE ================= */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitText();
            }}
          >
            <p className="text-gray-600 mb-4">
              Example: I have fever and headache with chest pain
            </p>

            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
              placeholder="Describe how you feel..."
              value={textInput}
              onChange={(e) => onTextInputChange(e.target.value)}
            />

            <button
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Analyzing..." : "Predict from Text"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PredictionForm;