import wave
import librosa
import pyaudio
import keyboard
import numpy as np
import librosa.display
import soundfile as sf
import noisereduce as nr
from scipy.signal import butter, lfilter

def record_audio(FORMAT, CHANNELS, RATE, CHUNK, AUDIO_FILE):
    """
    Thu âm và lưu tệp âm thanh.
    """
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

def load_audio(file_path):
    """
    Load tệp âm thanh.
    """
    audio, sr = librosa.load(file_path, sr=None, mono=False)
    return audio, sr


def trim_silence(audio, sr, top_db=20):
    """
    Loại bỏ yên lặng ở đầu và cuối tệp âm thanh.
    """
    trimmed_audio, _ = librosa.effects.trim(audio, top_db=top_db)
    return trimmed_audio


def reduce_noise(audio, sr):
    """
    Giảm tạp âm sử dụng noisereduce.
    """
    return nr.reduce_noise(y=audio, sr=sr)


def bandpass_filter(data, lowcut, highcut, sr, order=5):
    """
    Lọc phổ tần số để giữ lại dải tần của giọng nói.
    """
    nyquist = 0.5 * sr
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = butter(order, [low, high], btype='band')
    return lfilter(b, a, data)


def normalize_audio(audio, target_rms=0.1):
    """
    Chuẩn hóa âm lượng.
    """
    rms = np.sqrt(np.mean(audio**2))
    gain = target_rms / rms
    return audio * gain


def resample_audio(audio, orig_sr, target_sr=16000):
    """
    Chuyển đổi tần số mẫu về 16kHz.
    """
    return librosa.resample(audio, orig_sr=orig_sr, target_sr=target_sr)


def save_audio(audio, sr, output_path):
    """
    Lưu tệp âm thanh đã xử lý.
    """
    sf.write(output_path, audio, sr)


def audio_pipeline(file_path, output_path):
    audio, sr = load_audio(file_path)
    audio = trim_silence(audio, sr)
    audio = reduce_noise(audio, sr)
    # audio = normalize_audio(audio)
    # audio = resample_audio(audio, orig_sr=sr, target_sr=16000)
    save_audio(audio, 16000, output_path)
    print(f"Saved processed audio to {output_path}.")

def transcribe_audio(model, AUDIO_FILE):
    """
    Xử lý tệp âm thanh bằng model Whisper.
    """
    print("Đang xử lý âm thanh...")
    result = model.transcribe(AUDIO_FILE, fp16=False, language="en")
    print("Kết quả:", result["text"])
    return result["text"]