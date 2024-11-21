import pyaudio
import wave
import whisper
import keyboard
import os

# Cấu hình audio
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
AUDIO_FILE = "recorded_audio.wav"

# Khởi tạo model Whisper
model = whisper.load_model("medium")  # Hoặc "tiny" nếu cần tiết kiệm tài nguyên

# Hàm thu âm
def record_audio():
    print("Đang thu âm... Nhấn phím 'S' để dừng.")
    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    frames = []

    # Ghi âm khi không nhấn phím 'S'
    while not keyboard.is_pressed('s'):
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
    print("Thu âm hoàn tất. File lưu tại:", AUDIO_FILE)

# Hàm xử lý bằng Whisper
def transcribe_audio():
    print("Đang xử lý âm thanh...")
    result = model.transcribe(AUDIO_FILE, fp16=False, language="vi")
    print("Kết quả:", result["text"])
    return result["text"]

# Hàm chính
def main():
    print("Nhấn phím 'V' để bắt đầu thu âm...")
    while True:
        if keyboard.is_pressed('v'):  # Bắt đầu thu âm khi nhấn phím V
            record_audio()
            text = transcribe_audio()
            print("Nhấn 'Q' để thoát hoặc 'V' để thu âm lại.")
        
        if keyboard.is_pressed('q'):  # Thoát khi nhấn phím Q
            os.remove(AUDIO_FILE)
            print("Đã thoát chương trình.")
            break

# Chạy chương trình
if __name__ == "__main__":
    main()
