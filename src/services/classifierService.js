/**
 * Clothing Classifier Service
 * Communicates with the Qwen VL model API hosted on Google Colab via ngrok
 */

const getClassifierUrl = () => {
  const url = import.meta.env.VITE_CLASSIFIER_API_URL;
  if (!url) {
    throw new Error(
      'VITE_CLASSIFIER_API_URL is not set. Please update your .env file with the Colab ngrok URL.'
    );
  }
  return url.replace(/\/+$/, '');
};

/**
 * Send a clothing image to the Colab API for preprocessing + classification
 * @param {File} imageFile - The image file to classify
 * @returns {Promise<Object>} Classification result with processed image
 */
export const classifyClothing = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const baseUrl = getClassifierUrl();
  
  const response = await fetch(`${baseUrl}/api/classify`, {
    method: 'POST',
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Classification failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Classification failed');
  }

  return result.data;
};

/**
 * Check if the classifier API is available
 * @returns {Promise<boolean>}
 */
export const checkClassifierHealth = async () => {
  try {
    const baseUrl = getClassifierUrl();
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
};
