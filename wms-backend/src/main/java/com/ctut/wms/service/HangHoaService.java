package com.ctut.wms.service;

import com.ctut.wms.dto.HangHoaResponse;
import com.ctut.wms.dto.HangHoaRequest;
import com.ctut.wms.entity.HangHoa;
import com.ctut.wms.entity.LoaiHang;
import com.ctut.wms.mapper.HangHoaMapper;
import com.ctut.wms.repository.HangHoaRepository;
import com.ctut.wms.repository.LoaiHangRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@RequestMapping("/api/hang-hoa")
public class HangHoaService {

    private final HangHoaRepository hangHoaRepository;
    private final LoaiHangRepository  loaiHangRepository;
    private final HangHoaMapper hangHoaMapper;

    // LẤY DANH SÁCH
    public List<HangHoaResponse> getAllHangHoa(){
        return hangHoaRepository.findAll()
                .stream()
                .map(hangHoaMapper::toResponse)// MapStruct tự động chuyển Entity -> DTO
                .collect(Collectors.toList());
    }
    // LẤY CHI TIẾT 1 MÓN HÀNG
    public HangHoaResponse getHangHoaById(Integer id){
        HangHoa hangHoa = hangHoaRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy hàng hóa với ID: "+ id));
        return hangHoaMapper.toResponse(hangHoa);
    }
    // THÊM MỚI
    @Transactional
    public HangHoaResponse createHangHoa(HangHoaRequest request){
        // 1. Chuyển DTO thành Entity
        HangHoa hangHoa = hangHoaMapper.toEntity(request);
        // 2. Tìm LoaiHang từ DB và gán vào HangHoa
        LoaiHang loaiHang = loaiHangRepository.findById(request.getLoaiHangId())
                .orElseThrow(()-> new RuntimeException("Không tìm thấy loại hàng với ID:" + request.getLoaiHangId()));
        hangHoa.setLoaiHang(loaiHang);
        // 3. Lưu xuống DB
        HangHoa sevedHangHoa = hangHoaRepository.save(hangHoa);
        // 4. Trả về Response
        return hangHoaMapper.toResponse(sevedHangHoa);
    }
    // CẬP NHẬT
    @Transactional
    public HangHoaResponse updateHangHoa (Integer id, HangHoaRequest request){
        // 1. Tìm hàng hóa cũ
        HangHoa exstingHangHoa = hangHoaRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Không tìm thấy hàng hóa với ID: "+id));

        // 2. Chép dữ liệu mới đè lên cái cũ
        hangHoaMapper.updateEntityFromRequest(request, exstingHangHoa);

        // 3. Cập nhật lại LoaiHang nếu có thay đổi
        LoaiHang loaiHang = loaiHangRepository.findById(request.getLoaiHangId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa với ID:" +request.getLoaiHangId()));
        exstingHangHoa.setLoaiHang(loaiHang);
        // 4. Lưu và trả về
        HangHoa updatedHangHoa = hangHoaRepository.save(exstingHangHoa);
        return hangHoaMapper.toResponse(updatedHangHoa);
    }
    // XÓA
    @Transactional
    public void deleteHangHoa(Integer id){
        if (!hangHoaRepository.existsById(id)){
            throw new RuntimeException("Không tìm thấy hàng hóa với ID:" + id);
        }
        hangHoaRepository.deleteById(id);
    }
    public List<HangHoaResponse> layCanhBaoSapHetHang() {
        // Giả sử ngưỡng cảnh báo là dưới 10 sản phẩm
        int nguongCanhBao = 10;

        return hangHoaRepository.findTop5BySoLuongTonLessThanOrderBySoLuongTonAsc(nguongCanhBao)
                .stream()
                .map(hangHoaMapper::toResponse)
                .collect(Collectors.toList());
    }
    public List<HangHoaResponse> timKiemTheoTen(String tuKhoa) {
        return hangHoaRepository.findByTenHangContainingIgnoreCase(tuKhoa)
                .stream()
                .map(hangHoaMapper::toResponse)
                .collect(Collectors.toList());
    }



}
