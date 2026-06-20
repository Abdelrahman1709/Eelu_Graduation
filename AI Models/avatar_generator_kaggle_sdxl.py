# ==========================================
# ITLALA - إطلالة | Avatar Generator v4.0 (SDXL Kaggle)
# Full-Body Realistic Avatar Generator (Kaggle T4 GPU)
# ==========================================

import os
import json
import time
import random
import gradio as gr
import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageEnhance
from pyngrok import ngrok

# ==========================================
# 1. SETUP KAGGLE GPU MODEL (Diffusers SDXL)
# ==========================================
MODEL_ID = "SG161222/RealVisXL_V4.0"
pipe = None

print("⏳ جاري تحميل موديل RealVisXL على الـ GPU (مُهيأ لبيئة Kaggle)...")
try:
    pipe = StableDiffusionXLPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        variant="fp16",
        use_safetensors=True
    ).to("cuda")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    
    pipe.enable_model_cpu_offload()
    print("✅ تم تحميل موديل SDXL بنجاح وجاهز للعمل!")
except Exception as e:
    print(f"❌ حدث خطأ أثناء تحميل الموديل: {e}")

# ==========================================
# CONSTANTS & CONFIGURATIONS
# ==========================================
NEGATIVE_PROMPT = (
    "close up, portrait, headshot, bust shot, half body, waist up, cropped, out of frame, cut off feet, missing shoes, feet out of frame, cropped legs, cropped head, "
    "nsfw, nude, naked, bikini, swimwear, lingerie, underwear, bare skin, exposed breasts, cleavage, "
    "two people, multiple people, group, clones, duplicate, twins, "
    "deformed, worst quality, low quality, bad anatomy, bad proportions, disfigured, mutated, ugly, poorly drawn, "
    "laying down, sleeping, sitting, kneeling, dynamic pose, profile view, side view, "
    "beach, sand, bed, outdoors, dark background, shadow on wall, textured wall, wall, harsh lighting, strong contrast"
)

IMAGE_WIDTH = 768
IMAGE_HEIGHT = 1024

SKIN_TONES = [
    "Type I - Very Fair / أبيض فاتح جداً", "Type II - Fair / أبيض فاتح",
    "Type III - Medium / قمحي فاتح", "Type IV - Olive / قمحي",
    "Type V - Brown / أسمر", "Type VI - Dark Brown / أسمر داكن",
]

SKIN_TONE_DESCRIPTIONS = {
    "Type I - Very Fair / أبيض فاتح جداً": "pale white skin",
    "Type II - Fair / أبيض فاتح": "light fair skin",
    "Type III - Medium / قمحي فاتح": "light olive skin",
    "Type IV - Olive / قمحي": "warm olive Mediterranean skin",
    "Type V - Brown / أسمر": "warm brown skin",
    "Type VI - Dark Brown / أسمر داكن": "deep dark brown skin",
}

FACE_SHAPES = ["Oval / بيضاوي", "Round / مستدير", "Square / مربع", "Heart / قلب", "Oblong / مستطيل"]
EYE_COLORS = ["Brown / بني", "Black / أسود", "Green / أخضر", "Blue / أزرق", "Hazel / عسلي"]
EYEBROW_SHAPES = ["Thick / سميكة", "Thin / رفيعة", "Arched / مقوسة", "Straight / مستقيمة"]
GLASSES_OPTIONS = ["None / بدون", "Prescription glasses / نظارات طبية", "Sunglasses / نظارات شمسية"]

F_BODY_SHAPES = ["Hourglass", "Pear", "Rectangle", "Apple", "Inverted Triangle"]
F_HAIR_OPTIONS = ["Long straight hair / شعر طويل أملس", "Short hair / شعر قصير", "Curly hair / شعر مجعد", "Wearing a neat hijab / طرحة أنيقة", "Wearing a turban / توربان"]

M_BODY_SHAPES = ["Trapezoid (Athletic)", "Inverted Triangle", "Rectangle", "Oval", "Triangle"]
M_HAIR_OPTIONS = ["Short hair / شعر قصير", "Short hair with beard / شعر قصير مع لحية", "Bald / أصلع", "Bald with beard / أصلع مع لحية", "Curly hair / شعر مجعد", "Curly hair with beard / شعر مجعد مع لحية"]

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def validate_inputs(height: int, weight: int, age: int):
    height_m = height / 100.0
    bmi = weight / (height_m ** 2)
    if bmi < 10 or bmi > 70: raise gr.Error(f"⚠️ المقاسات المدخلة غير واقعية (BMI = {bmi:.1f}).")
    if age < 15 or age > 80: raise gr.Error("⚠️ العمر يجب أن يكون بين 15 و 80 سنة.")
    return bmi

def get_bmi_description(bmi: float) -> str:
    if bmi < 18.5: return "very thin and slender body, skinny"
    elif bmi <= 24.9: return "fit and well-proportioned body"
    elif bmi <= 29.9: return "solid slightly stocky body, curvy"
    elif bmi <= 34.9: return "heavy-set wide overweight body, thick"
    elif bmi <= 39.9: return "very large wide obese body"
    else: return "extremely large heavy-set obese body, extremely overweight"

def cm_to_proportions_female(bust_cm: int, waist_cm: int, hips_cm: int) -> str:
    return f"{bust_cm}cm bust, {waist_cm}cm waist, {hips_cm}cm hips"

def cm_to_proportions_male(chest_cm: int, waist_cm: int, thigh_cm: int) -> str:
    return f"{chest_cm}cm chest, {waist_cm}cm waist, {thigh_cm}cm thighs"

def post_process_avatar(image: Image.Image) -> Image.Image:
    image = ImageEnhance.Sharpness(image).enhance(1.4)
    image = ImageEnhance.Contrast(image).enhance(1.1)
    image = ImageEnhance.Color(image).enhance(1.05)
    return image

# ==========================================
# CORE GENERATION LOGIC
# ==========================================
def generate_avatar_flow(
    gender, age, height, weight, skin_tone,
    face_shape, eye_color, eyebrow_shape, glasses,
    f_body_shape, f_bust_cm, f_waist_cm, f_hips_cm, f_hair,
    m_body_shape, m_chest_cm, m_waist_cm, m_thigh_cm, m_hair, seed_mode, last_seed,
):
    global pipe
    if pipe is None: raise gr.Error("❌ لم يتم تحميل الموديل. تأكد من تفعيل الـ GPU في Kaggle.")

    bmi = validate_inputs(height, weight, age)
    build_modifier = get_bmi_description(bmi)
    
    if seed_mode == "تثبيت (نفس الشخصية السابقة)" and last_seed != 0:
        used_seed = int(last_seed)
    else:
        used_seed = random.randint(1, 2**32 - 1)
        
    is_female = (gender == "Female / أنثى")
    person_type = "woman" if is_female else "man"

    skin_desc = SKIN_TONE_DESCRIPTIONS.get(skin_tone, "olive skin")
    face = face_shape.split(" / ")[0].lower()
    eyes = eye_color.split(" / ")[0].lower()
    brows = eyebrow_shape.split(" / ")[0].lower()
    glass = glasses.split(" / ")[0].lower()

    # 1. Subject & Age Tags
    age_tag = f"{age}yo"
    if age >= 60: age_tag += " elderly old wrinkles"
    elif age >= 40: age_tag += " mature"
        
    subject = f"1girl, solo, {age_tag}" if is_female else f"1boy, solo, {age_tag}"

    # 2. Face Tags
    face_tags = f"{skin_desc}, {face} face, {eyes} eyes, {brows} eyebrows"
    if glass != "none":
        face_tags = f"wearing {glass}, " + face_tags

    # 3. Body Shape, Weight & Measurements Translation
    measurement_tags = []
    body_shape_val = f_body_shape.split(" / ")[0].lower() if is_female else m_body_shape.split(" / ")[0].lower()
    
    if is_female:
        if f_bust_cm >= 105: measurement_tags.append("large bust")
        elif f_bust_cm <= 80: measurement_tags.append("small bust")
        if f_waist_cm <= 65: measurement_tags.append("narrow waist")
        elif f_waist_cm >= 90: measurement_tags.append("wide waist")
        if f_hips_cm >= 110: measurement_tags.append("wide hips, thick thighs")
        elif f_hips_cm <= 85: measurement_tags.append("narrow hips")
    else:
        if m_chest_cm >= 110: measurement_tags.append("broad chest")
        if m_thigh_cm >= 65: measurement_tags.append("thick thighs")

    meas_str = ", ".join(measurement_tags)

    if bmi >= 35:
        body_tags = f"morbidly obese, very fat, extremely overweight, huge body, {meas_str}"
    elif bmi >= 30:
        body_tags = f"obese, fat, heavy-set, overweight, {meas_str}"
    elif bmi < 18.5:
        body_tags = f"skinny, very thin, slender, {meas_str}"
    else:
        body_tags = f"fit body, {body_shape_val} shape, {meas_str}"

    # 4. Hair & Clothing Tags
    hair = f_hair.split(" / ")[0].lower() if is_female else m_hair.split(" / ")[0].lower()
    if is_female:
        if "hijab" in hair or "turban" in hair or "طرحة" in hair:
            clothing_tags = f"modest hijab covering hair, fully clothed, tight grey turtleneck shirt, tight grey leggings"
        else:
            clothing_tags = f"{hair}, fully clothed, tight grey turtleneck shirt, tight grey leggings"
    else:
        clothing_tags = f"{hair}, fully clothed, tight grey t-shirt, tight grey sweatpants"

    # 5. Camera & Environment Tags
    env_tags = "full body shot, entire body visible from head to toe, completely visible feet and shoes, extreme wide shot, pure white background"
    quality_tags = "RAW photo, 8k uhd, highly detailed"

    final_prompt = f"{env_tags}, {clothing_tags}, {body_tags}, {subject}, {face_tags}, {quality_tags}"

    print(f"\n{'='*60}\n📋 Generated Prompt (SDXL | Seed: {used_seed}):\n{'='*60}\n{final_prompt}\n")

    try:
        generator = torch.Generator(device="cuda").manual_seed(used_seed)
        
        image = pipe(
            prompt=final_prompt,
            negative_prompt=NEGATIVE_PROMPT,
            num_inference_steps=25, 
            guidance_scale=6.0,
            width=IMAGE_WIDTH,
            height=IMAGE_HEIGHT,
            generator=generator
        ).images[0]
        
    except Exception as e:
        raise gr.Error(f"❌ فشل التوليد: {str(e)}")

    image = post_process_avatar(image)
    output_path = os.path.abspath("generated_avatar_sdxl.png")
    image.save(output_path, quality=95)
    return output_path, f"✅ تم التوليد بنجاح | Seed: {used_seed}", output_path, used_seed

# ==========================================
# UI & EVENTS
# ==========================================
PRESETS_FILE = "avatar_presets_sdxl.json"
def load_presets_from_file():
    try:
        with open(PRESETS_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except: return {}

def save_presets_to_file(presets):
    with open(PRESETS_FILE, "w", encoding="utf-8") as f: json.dump(presets, f, ensure_ascii=False, indent=2)

def save_preset(preset_name, gender, age, height, weight, skin_tone, face_shape, eye_color, eyebrow_shape, glasses_opt, f_body_shape, f_bust_cm, f_waist_cm, f_hips_cm, f_hair, m_body_shape, m_chest_cm, m_waist_cm, m_thigh_cm, m_hair, seed_mode, last_seed):
    if not preset_name: raise gr.Error("⚠️ يرجى كتابة اسم للـ Preset.")
    presets = load_presets_from_file()
    saved_seed = last_seed if seed_mode == "تثبيت (نفس الشخصية السابقة)" else 0
    presets[preset_name.strip()] = {"gender": gender, "age": age, "height": height, "weight": weight, "skin_tone": skin_tone, "face_shape": face_shape, "eye_color": eye_color, "eyebrow_shape": eyebrow_shape, "glasses": glasses_opt, "f_body_shape": f_body_shape, "f_bust_cm": f_bust_cm, "f_waist_cm": f_waist_cm, "f_hips_cm": f_hips_cm, "f_hair": f_hair, "m_body_shape": m_body_shape, "m_chest_cm": m_chest_cm, "m_waist_cm": m_waist_cm, "m_thigh_cm": m_thigh_cm, "m_hair": m_hair, "seed": saved_seed}
    save_presets_to_file(presets)
    return gr.update(choices=list(presets.keys()), value=preset_name.strip()), f"✅ تم حفظ: '{preset_name.strip()}'"

def load_preset(preset_name):
    presets = load_presets_from_file()
    p = presets.get(preset_name, {})
    is_f = (p.get("gender") == "Female / أنثى")
    saved_seed = p.get("seed", 0)
    target_mode = "تثبيت (نفس الشخصية السابقة)" if saved_seed != 0 else "عشوائي (شخصية جديدة)"
    return (p.get("gender"), p.get("age"), p.get("height"), p.get("weight"), p.get("skin_tone"), p.get("face_shape"), p.get("eye_color"), p.get("eyebrow_shape"), p.get("glasses"), p.get("f_body_shape"), p.get("f_bust_cm"), p.get("f_waist_cm"), p.get("f_hips_cm"), p.get("f_hair"), p.get("m_body_shape"), p.get("m_chest_cm"), p.get("m_waist_cm"), p.get("m_thigh_cm"), p.get("m_hair"), target_mode, saved_seed, gr.update(visible=is_f), gr.update(visible=not is_f))

custom_css = ".rtl-text { direction: rtl; text-align: right; } .gradio-container { font-family: 'Cairo', 'Inter', sans-serif !important; max-width: 1400px !important; margin: 0 auto !important; } .header-banner { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); border-radius: 16px; padding: 30px; margin-bottom: 20px; text-align: center; color: white; } .header-banner h1 { font-size: 2.5em; margin-bottom: 5px; color: white !important; } .header-banner h3 { color: rgba(255,255,255,0.9) !important; font-weight: 400; } .seed-info { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px; text-align: center; font-weight: bold; } .preset-section { background: #f0fdf4; border: 1px solid #6ee7b7; border-radius: 12px; padding: 15px; margin: 10px 0; } #output_image_display { border: 3px solid #10b981; border-radius: 12px; }"
theme = gr.themes.Soft(primary_hue="emerald", secondary_hue="green", font=[gr.themes.GoogleFont("Cairo"), "sans-serif"])

with gr.Blocks(theme=theme, title="ITLALA v4.0 (SDXL)", css=custom_css) as demo:
    gr.HTML("<div class='header-banner'><h1>✨ ITLALA v4.0 (SDXL) - إطلالة ✨</h1><h3>Kaggle Notebook Edition - RealVisXL_V4.0</h3></div>")

    with gr.Row():
        with gr.Column(scale=1):
            with gr.Accordion("💾 Presets", open=False, elem_classes="preset-section"):
                with gr.Row():
                    preset_name_input = gr.Textbox(label="اسم الـ Preset", scale=2)
                    save_preset_btn = gr.Button("💾 حفظ", variant="secondary", scale=1)
                with gr.Row():
                    preset_dropdown = gr.Dropdown(choices=list(load_presets_from_file().keys()), label="تحميل Preset", scale=2)
                    load_preset_btn = gr.Button("📂 تحميل", variant="secondary", scale=1)
                preset_status = gr.Textbox(label="الحالة", interactive=False)

            gr.Markdown("### 👤 Demographic")
            with gr.Row():
                gender_radio = gr.Radio(choices=["Female / أنثى", "Male / ذكر"], value="Female / أنثى", label="Gender", interactive=True)
                age_slider = gr.Slider(minimum=15, maximum=80, value=25, step=1, label="Age")

            gr.Markdown("### 📏 Body Dimensions")
            with gr.Row():
                height_slider = gr.Slider(minimum=130, maximum=220, value=165, step=1, label="Height (cm)")
                weight_slider = gr.Slider(minimum=35, maximum=180, value=65, step=1, label="Weight (kg)")

            skin_tone_dropdown = gr.Dropdown(choices=SKIN_TONES, value="Type IV - Olive / قمحي", label="Skin Tone")

            gr.Markdown("### 👁️ Facial Details")
            with gr.Row():
                face_shape_dd = gr.Dropdown(choices=FACE_SHAPES, value="Oval / بيضاوي", label="Face Shape")
                eye_color_dd = gr.Dropdown(choices=EYE_COLORS, value="Brown / بني", label="Eye Color")
            with gr.Row():
                eyebrow_dd = gr.Dropdown(choices=EYEBROW_SHAPES, value="Thick / سميكة", label="Eyebrows")
                glasses_dd = gr.Dropdown(choices=GLASSES_OPTIONS, value="None / بدون", label="Glasses")

            with gr.Column(visible=True) as female_col:
                gr.Markdown("### 👗 Female Body")
                f_body_shape_dd = gr.Dropdown(choices=F_BODY_SHAPES, value="Hourglass", label="Body Shape")
                with gr.Row():
                    f_bust_slider = gr.Slider(minimum=70, maximum=130, value=90, step=1, label="Bust (cm)")
                    f_waist_slider = gr.Slider(minimum=55, maximum=120, value=70, step=1, label="Waist (cm)")
                    f_hips_slider = gr.Slider(minimum=75, maximum=140, value=95, step=1, label="Hips (cm)")
                f_hair_dd = gr.Dropdown(choices=F_HAIR_OPTIONS, value="Wearing a neat hijab / طرحة أنيقة", label="Hair or Hijab")

            with gr.Column(visible=False) as male_col:
                gr.Markdown("### 👔 Male Body")
                m_body_shape_dd = gr.Dropdown(choices=M_BODY_SHAPES, value="Trapezoid (Athletic)", label="Body Shape")
                with gr.Row():
                    m_chest_slider = gr.Slider(minimum=80, maximum=140, value=100, step=1, label="Chest (cm)")
                    m_waist_slider = gr.Slider(minimum=60, maximum=130, value=85, step=1, label="Waist (cm)")
                    m_thigh_slider = gr.Slider(minimum=40, maximum=80, value=55, step=1, label="Thigh (cm)")
                m_hair_dd = gr.Dropdown(choices=M_HAIR_OPTIONS, value="Short hair with beard / شعر قصير مع لحية", label="Hair & Beard")

            seed_mode = gr.Radio(choices=["عشوائي (شخصية جديدة)", "تثبيت (نفس الشخصية السابقة)"], value="عشوائي (شخصية جديدة)", label="وضع التوليد (التحكم في الشخصية)")
            last_seed_state = gr.Number(value=0, visible=False)
            generate_btn = gr.Button("✨ إنشاء الآفاتار (SDXL) ✨", variant="primary", size="lg")

        with gr.Column(scale=1):
            gr.Markdown("### 🖼️ Generated Full-Body Avatar")
            output_image = gr.Image(label="VTO-Ready Output", type="filepath", elem_id="output_image_display", height=650)
            seed_info_text = gr.Textbox(label="معلومات التوليد", interactive=False, elem_classes="seed-info")
            download_btn = gr.DownloadButton("⬇️ تحميل الآفاتار", visible=False, variant="secondary", size="lg")

    def on_generate_click(*args):
        img_path, info_txt, out_path, new_seed = generate_avatar_flow(*args)
        return img_path, info_txt, gr.update(visible=True, value=out_path), new_seed

    gender_radio.change(fn=lambda x: (gr.update(visible=x=="Female / أنثى"), gr.update(visible=x!="Female / أنثى")), inputs=gender_radio, outputs=[female_col, male_col])
    generate_btn.click(fn=on_generate_click, inputs=[gender_radio, age_slider, height_slider, weight_slider, skin_tone_dropdown, face_shape_dd, eye_color_dd, eyebrow_dd, glasses_dd, f_body_shape_dd, f_bust_slider, f_waist_slider, f_hips_slider, f_hair_dd, m_body_shape_dd, m_chest_slider, m_waist_slider, m_thigh_slider, m_hair_dd, seed_mode, last_seed_state], outputs=[output_image, seed_info_text, download_btn, last_seed_state], api_name="generate", show_progress="full")
    save_preset_btn.click(fn=save_preset, inputs=[preset_name_input, gender_radio, age_slider, height_slider, weight_slider, skin_tone_dropdown, face_shape_dd, eye_color_dd, eyebrow_dd, glasses_dd, f_body_shape_dd, f_bust_slider, f_waist_slider, f_hips_slider, f_hair_dd, m_body_shape_dd, m_chest_slider, m_waist_slider, m_thigh_slider, m_hair_dd, seed_mode, last_seed_state], outputs=[preset_dropdown, preset_status])
    load_preset_btn.click(fn=load_preset, inputs=[preset_dropdown], outputs=[gender_radio, age_slider, height_slider, weight_slider, skin_tone_dropdown, face_shape_dd, eye_color_dd, eyebrow_dd, glasses_dd, f_body_shape_dd, f_bust_slider, f_waist_slider, f_hips_slider, f_hair_dd, m_body_shape_dd, m_chest_slider, m_waist_slider, m_thigh_slider, m_hair_dd, seed_mode, last_seed_state, female_col, male_col])

if __name__ == "__main__":
    NGROK_AUTH_TOKEN = os.environ.get("NGROK_AUTH_TOKEN", "").strip()
    PORT = 7860
    if not NGROK_AUTH_TOKEN: NGROK_AUTH_TOKEN = input("Ngrok Token (اختياري): ").strip()
    if NGROK_AUTH_TOKEN:
        try:
            ngrok.set_auth_token(NGROK_AUTH_TOKEN)
            ngrok.kill()
            print(f"🚀 NGROK URL: {ngrok.connect(PORT).public_url}")
        except Exception as e: print(f"⚠️ Ngrok failed: {e}")
    
    # Kaggle allows direct sharing without Ngrok via share=True
    print("🚀 Starting Server. If Ngrok fails, use the Gradio Public URL generated below.")
    demo.launch(server_port=PORT, share=True, debug=True, show_error=True)
