import tkinter as tk
from tkinter import StringVar
import pyaudio
import wave
import whisper
import threading

# Cấu hình audio
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
AUDIO_FILE = "recorded_audio.wav"

# Khởi tạo model Whisper
model = whisper.load_model("small")  # Sử dụng "tiny" nếu cần tiết kiệm tài nguyên

# Hàm thu âm
def record_audio(start_btn, output_var, is_recording):
    def start_recording():
        nonlocal is_recording  # Đây là cách để tham chiếu đến biến bên ngoài hàm
        is_recording = True
        start_btn.config(text="■", bg="red")  # Đổi nút thành hình vuông
        print("Đang thu âm...")

        audio = pyaudio.PyAudio()
        stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
        frames = []

        # Ghi âm trong khi chưa nhấn nút dừng
        while is_recording:
            data = stream.read(CHUNK)
            frames.append(data)

        # Kết thúc thu âm
        stream.stop_stream()
        stream.close()
        audio.terminate()

        # Lưu file âm thanh
        wf = wave.open(AUDIO_FILE, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        print("Thu âm hoàn tất.")

        # Chạy Whisper trên file đã ghi
        transcribe_audio(output_var)
        start_btn.config(text="🎤", bg="green")  # Trả nút về icon mic

    def stop_recording():
        nonlocal is_recording  # Khai báo nonlocal để thay đổi giá trị của biến ngoài
        is_recording = False

    if start_btn["text"] == "🎤":  # Nếu đang là mic
        threading.Thread(target=start_recording).start()  # Chạy thu âm trong luồng riêng
    else:
        stop_recording()

# Hàm xử lý âm thanh bằng Whisper
def transcribe_audio(output_var):
    print("Đang xử lý âm thanh...")
    result = model.transcribe(AUDIO_FILE, fp16=False)
    output_var.set(result["text"])  # Cập nhật text ở phần trên
    print("Kết quả:", result["text"])

# Tạo giao diện bằng Tkinter
def create_ui():
    # Khai báo biến is_recording trong hàm create_ui
    is_recording = False

    # Tạo cửa sổ chính
    root = tk.Tk()
    root.title("Speech to Text")
    root.geometry("500x300")
    root.resizable(False, False)

    # Tạo biến StringVar để cập nhật text
    output_var = StringVar()
    output_var.set("Kết quả sẽ hiển thị tại đây...")

    # Phần trên: Kết quả
    output_label = tk.Label(root, textvariable=output_var, wraplength=480, font=("Arial", 14), justify="left", bg="white", anchor="w")
    output_label.pack(fill="both", expand=True, padx=10, pady=10)

    # Phần dưới: Nút ghi âm
    start_btn = tk.Button(root, text="🎤", font=("Arial", 20), bg="green", fg="white", width=5, height=2, command=lambda: record_audio(start_btn, output_var, is_recording))
    start_btn.pack(pady=20)

    # Khởi chạy giao diện
    root.mainloop()

if __name__ == "__main__":
    create_ui()
