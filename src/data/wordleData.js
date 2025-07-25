/**
 * Wordle Tiếng Việt - Dữ liệu từ điển
 * Lọc từ file words_perfect_2_syllables.js
 * Chỉ lấy từ có đúng 7 chữ cái khi bỏ dấu
 * Sử dụng thuật toán chọn từ phổ biến cải tiến
 */

// Hàm normalize để chuyển từ có dấu thành không dấu
export const normalize = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
};

// Danh sách từ để đoán (target words) - 300 từ phổ biến
export const targetWords = [
  "ánh sáng",
  "bầu trời",
  "cây xanh",
  "học sinh",
  "khó khăn",
  "làm việc",
  "ngôi sao",
  "thay đổi",
  "á nguyên",
  "ác chiến",
  "ác chứng",
  "ác miệng",
  "ái khanh",
  "ai khiến",
  "ái Nghĩa",
  "ái nhiễm",
  "ái nương",
  "ái thiếp",
  "am tường",
  "án huyệt",
  "an hưởng",
  "an nhiên",
  "án quyết",
  "án tuyết",
  "Anh Dũng",
  "ánh hồng",
  "anh hùng",
  "anh kiệt",
  "anh nhuệ",
  "anh nuôi",
  "anh quân",
  "anh ruột",
  "ảnh thật",
  "ánh thép",
  "anh tuấn",
  "ao chuôm",
  "áo khách",
  "áo khoác",
  "áo lương",
  "áo nhộng",
  "áo phông",
  "ảo thuật",
  "áo thùng",
  "ảo tưởng",
  "áp huyết",
  "áp phích",
  "ăn boóng",
  "ăn chằng",
  "ăn chung",
  "ăn khách",
  "ăn không",
  "ăn kiêng",
  "ăn nguội",
  "ăn quanh",
  "ăn sương",
  "ẳng Cang",
  "ắng họng",
  "ắng lặng",
  "âm chính",
  "âm dương",
  "âm hưởng",
  "âm lượng",
  "ẩm nhiệt",
  "âm phong",
  "âm thanh",
  "âm trình",
  "ân chiếu",
  "ân Phong",
  "ấn triện",
  "Âu trang",
  "ấu Triệu",
  "ấu trùng",
  "bá chiếm",
  "bả chuột",
  "ba giăng",
  "bà hoàng",
  "ba không",
  "bã miệng",
  "bà ngoại",
  "bà phước",
  "bá quyền",
  "ba tháng",
  "ba trăng",
  "bá vương",
  "bạc điền",
  "bác đoạt",
  "bạc giấy",
  "bạc hạnh",
  "bác loạn",
  "bạc lông",
  "bạc mệnh",
  "bạc nghệ",
  "bạc nhạc",
  "bạc phau",
  "bạc phận",
  "bạc ròng",
  "bác ruột",
  "bạc thau",
  "bạc tình",
  "bác tước",
  "bạch cập",
  "bạch câu",
  "bạch chỉ",
  "bạch cúc",
  "bách dầu",
  "bạch đái",
  "bạch đàn",
  "bạch đới",
  "bạch hầu",
  "bách hoa",
  "bách hợp",
  "bách kim",
  "bạch lạp",
  "bạch quả",
  "bạch quỉ",
  "bạch sản",
  "bách tán",
  "bách thế",
  "bạch thỏ",
  "bách thú",
  "bách tuế",
  "bạch yến",
  "bài báng",
  "bãi biển",
  "bái biệt",
  "bãi binh",
  "bãi buôi",
  "bài chài",
  "bãi chầu",
  "bài chòi",
  "bãi chức",
  "bãi công",
  "bãi dịch",
  "bài giải",
  "bại hoại",
  "bài khoá",
  "bái kiến",
  "bài liệt",
  "bái lĩnh",
  "bái mạng",
  "bãi miễn",
  "bài niệu",
  "bái phục",
  "bại quân",
  "bãi thải",
  "bãi thực",
  "bài tiết",
  "bài tính",
  "bài toán",
  "bại trận",
  "bái vọng",
  "bài xích",
  "bài xuất",
  "bán buôn",
  "bán chác",
  "bàn chải",
  "bán chạy",
  "bàn chặm",
  "bàn chân",
  "bản chất",
  "bán chịu",
  "bản chức",
  "bàn cuốc",
  "bán danh",
  "bán diện",
  "bạn đảng",
  "bàn định",
  "bán đoạn",
  "bán đứng",
  "bàn giao",
  "bàn gìặt",
  "bàn giấy",
  "bán hàng",
  "ban hành",
  "bản hiệu",
  "bàn hoàn",
  "ban hồng",
  "bán khai",
  "bản khắc",
  "bán kính",
  "bản lĩnh",
  "bạn lòng",
  "bàn luận",
  "bán mạng",
  "bàn mảnh",
  "bản mệnh",
  "ban miêu",
  "bán mình",
  "bản năng",
  "ban ngày",
  "bản nhạc",
  "bản nháp",
  "ban nhật",
  "bán niên",
  "bán nước",
  "ban phát",
  "bàn phím",
  "bản quán",
  "bản quốc",
  "bán rong",
  "bàn rung",
  "ban sáng",
  "bàn soạn",
  "ban tặng",
  "bán tháo",
  "bàn thấm",
  "bán thân",
  "bàn tiện",
  "bàn tính",
  "bán tống",
  "bàn tròn",
  "ban trưa",
  "ban vàng",
  "bán viên",
  "bàn xiết",
  "bàn xoay",
  "bàng bạc",
  "bàng cận",
  "bảng đen",
  "bảng ghi",
  "bảng màu",
  "bảng nhỏ",
  "bảng tra",
  "bang trợ",
  "bánh bao",
  "bánh bèo",
  "bánh bìa",
  "bánh cắt",
  "bánh chả",
  "bánh chè",
  "bánh cóc",
  "bánh cốm",
  "bánh dẻo",
  "bánh dừa",
  "bánh đai",
  "bánh đậu",
  "bánh đúc",
  "bánh ếch",
  "bánh gai",
  "bánh gio",
  "bánh gối",
  "bánh hơi",
  "bánh kem",
  "bánh kẹo",
  "bánh kẹp",
  "bánh lái",
  "bánh lốp",
  "bánh mật",
  "bánh nậm",
  "bánh nếp",
  "bánh phở",
  "bánh quế",
  "bánh qui",
  "bánh quy",
  "bánh ram",
  "bánh rán",
  "bánh rợm",
  "bánh sắn",
  "bánh sữa",
  "bánh tày",
  "bánh tét",
  "bánh tôm",
  "bánh tro",
  "bánh ướt",
  "bánh vít",
  "bánh xèo",
  "bánh xốp",
  "bạo bệnh",
  "bao biếm",
  "bao biện",
  "bão bùng",
  "bao chầy",
  "bào chữa",
  "báo công",
  "báo danh",
  "báo giới",
  "bạo hành",
  "bảo hiểm",
  "bao hình",
  "bảo kiếm",
  "bảo lãnh",
  "báo liếp",
  "bạo liệt",
  "bạo loạn",
  "bảo mạng",
  "bảo mệnh",
  "báo mộng",
  "bào muội",
  "bào nang",
  "bão nước",
  "bào phác",
  "bạo phát",
  "bao phấn",
  "bạo phổi",
  "báo phục",
  "bao quản",
  "bao quát",
  "báo quốc",
  "bào rãnh",
  "bão rong",
  "bảo sanh",
  "bảo sinh",
  "báo tang",
  "bào thai",
  "bảo tháp",
  "bạo thần",
  "bao thầu",
  "báo thức",
  "báo tiệp",
  "bao tiêu",
  "bao trùm",
  "bao xiết",
  "báo xuân",
  "bát chậu",
  "bát diện",
  "bát giác",
  "bát giới",
  "bạt mạng",
  "bạt ngàn",
  "bát ngát",
  "bát ngôn",
  "bát nháo",
  "bát phẩm",
  "bát quái",
  "bát sách",
  "bát sành",
  "bát sừng",
  "bát tiên",
  "bát tiết",
  "bát tiễu",
  "bát trân",
  "bát tuần",
  "bàu bĩnh",
  "báu ngọc",
  "bàu nhàu",
  "bay biến",
  "bay bổng",
  "bay bướm",
  "bày hàng",
  "bay lượn",
  "bảy mươi",
  "bay nhảy",
  "bày việc",
  "bắc thần",
  "băm viên",
  "bắn bổng",
  "bằng bặn",
  "bằng cấp",
  "băng cầu",
  "băng đai",
  "băng đạn",
  "băng đảo",
  "bằng địa",
  "băng gầu",
  "băng lăn",
  "bằng mặt",
  "bằng nào",
  "bằng nay",
  "bằng như",
  "bằng sắc",
  "băng sơn",
  "băng tải",
  "băng tay",
  "băng tâm",
  "bẵng tin",
  "băng túp",
  "bằng vai",
  "bắp chân",
  "bắp thịt",
  "bắt bánh",
  "bắt buộc",
  "bắt chẹt",
  "bắt chim",
  "bắt chợp",
  "bắt được",
  "bắt giam",
  "bắt lính",
  "bắt mạch",
  "bắt nhịp",
  "bắt nhời",
  "bắt phạt",
  "bắt sống",
  "bắt thăm",
  "bắt thóp",
  "bắt tréo",
  "bắt trớn",
  "bậc nước",
  "bậc thầy",
  "bậc thềm",
  "bẩm bạch",
  "bấm bụng",
  "bẩm chất",
  "bấm điện",
  "bầm giập",
  "bẩm mệnh",
  "bấm ngọn",
  "bẩm sinh",
  "bẩm tính",
  "bậm trợn",
  "bần bách",
  "bẩn bụng",
  "bận cẳng",
  "bần cùng",
  "bấn loạn",
  "bần nông",
  "bẩn thỉu",
  "bấn túng",
  "bẩn tưởi",
  "bâng quơ",
  "bấp bênh",
  "bấp bông",
  "bập bung",
  "bất bằng",
  "bất biến",
  "bất bình",
  "bật bông",
  "bất chắc",
  "bất chấp",
  "bất chợt",
  "bất công",
  "bật cười",
  "bất diệt",
  "bất dung",
  "bất đẳng",
  "bất định",
  "bất hiếu",
  "bật hồng",
  "bất kham",
  "bật khóc",
  "bất kính",
  "bất luận",
  "bất minh",
  "bất nghì",
  "bật ngửa",
  "bất nhân",
  "bất nhất",
  "bất nhơn",
  "bất pháp",
  "bất phân",
  "bất phục",
  "bất quản",
  "bất thần",
  "bất thời",
  "bất thực",
  "bất tình",
  "bất toàn",
  "bất trắc",
  "bật tung",
  "bầu chọn",
  "bầu diều",
  "bầu đoàn",
  "bầu đông",
  "bầu giác",
  "bầu tiên",
  "bây chầy",
  "bẫy lồng",
  "bẫy lưới",
  "bấy thuở",
  "bẹ chuối",
  "bé miệng",
  "bèm nhèm",
  "bén mảng",
  "bén ngót",
  "bèo bồng",
  "béo ngấy",
  "bèo nhèo",
  "béo nịch",
  "bèo nước",
  "béo quay",
  "béo sưng",
  "béo tròn",
  "bét nhèm",
  "bế giảng",
  "bề ngang",
  "bề ngoài",
  "bệ phóng",
  "bề trong",
  "bệch bạc",
  "bến cảng",
  "bên cạnh",
  "bền chặt",
  "bên dưới",
  "bên lòng",
  "bến nước",
  "bên trên",
  "bền vững",
  "bến vượt",
  "bệnh căn",
  "bệnh dại",
  "bệnh học",
  "bệnh kín",
  "bệnh nhi",
  "bệnh tật",
  "bênh vực",
  "bếp đứng",
  "bếp nước",
  "bêu diếu",
  "bêu nắng",
  "bệu rệch",
  "bêu riếu",
  "bì khổng",
  "bì quyện",
  "bí quyết",
  "bi thiết",
  "bí thuật",
  "bi tráng",
  "bia tươi",
  "bích báo",
  "bích qui",
  "bích quy",
  "biếm hoạ",
  "biện bác",
  "biên bản",
  "biến báo",
  "biến cải",
  "biến cảm",
  "biên chế",
  "biên chú",
  "biên đạo",
  "biển đậu",
  "biên đội",
  "biên lai",
  "biển lận",
  "biên mậu",
  "biến sắc",
  "biên tái",
  "biên tập",
  "biến tấu",
  "biến thế",
  "biển thủ",
  "biến tốc",
  "biến trá",
  "biến trở",
  "biền văn",
  "biếng ăn",
  "biết bao",
  "biết cho",
  "biệt đãi",
  "biết đâu",
  "biệt lập",
  "biết mấy",
  "biết mùi",
  "biệt ngữ",
  "biết sao",
  "biệt tài",
  "biết tay",
  "biệt tăm",
  "biết thế",
  "biệt thị",
  "biệt thự",
  "biệt tin",
  "biệt trú",
  "biệt ứng",
  "biểu cảm",
  "biểu đạt",
  "biểu mẫu",
  "biểu ngữ",
  "biểu tấu",
  "biểu thị",
  "biếu xén",
  "bin đinh",
  "bình bán",
  "bình bát",
  "bình bầu",
  "bình bút",
  "bình cầu",
  "binh chế",
  "bình chú",
  "bình địa",
  "binh đội",
  "binh khí",
  "binh khố",
  "binh lửa",
  "bình lưu",
  "Bình Nam",
  "binh ngũ",
  "binh phí",
  "bình sai",
  "binh thế",
  "bình thì",
  "binh thư",
  "bình trà",
  "bình vôi",
  "bình xét",
  "bình xịt",
  "bít bưng",
  "bít họng",
  "blu dông",
  "bó chiếu",
  "bỏ hoang",
  "bỏ không",
  "bỏ phiếu",
  "bỏ thõng",
  "bỏ thuốc",
  "bỏ trống",
  "bóc niêm",
  "bóc trần",
  "bói chèo",
  "bói kiều",
  "bòi ngòi",
  "bói toán",
  "bom bướm",
  "bom cháy",
  "bom chìm",
  "bòn chài",
  "bọn mình",
  "bòn nhặt",
  "bón phân",
  "bón thúc",
  "bóng bàn",
  "bóng bay",
  "bóng câu",
  "bóng cây",
  "bỏng cốm",
  "bóng dâu",
  "bóng đái",
  "bóng đèn",
  "bong gân",
  "bóng gió",
  "bóng hạc",
  "bóng lẫy",
  "bóng lộn",
  "bóng mát",
  "bóng mây",
  "bóng mực",
  "bóng ném",
  "bóng nga",
  "bỏng ngô",
  "bọng ong",
  "bóng quế",
  "bóng râm",
  "bóng tàu",
  "bóng thỏ",
  "bóng thủ",
  "bóng tối",
  "bóng vía",
  "bóp bụng",
  "bóp chắt",
  "bóp chẹt",
  "bóp họng",
  "bóp lưng",
  "bóp thắt",
  "bóp trán",
  "bọt biển",
  "bố chánh",
  "bộ chiến",
  "bố chính",
  "bố chồng",
  "bổ chửng",
  "bố dượng",
  "bổ huyết",
  "bổ nghĩa",
  "bổ nhiệm",
  "bổ nhoài",
  "bố phượu",
  "bộ tướng",
  "bổ xuyết",
  "bộ xương",
  "bộc bạch",
  "bốc chài",
  "bốc cháy",
  "bốc giời",
  "bốc nóng",
  "bộc phát",
  "bốc phép",
  "bốc phét",
  "bốc thơm",
  "bốc trời",
  "bộc trực",
  "bối cảnh",
  "bội giáo",
  "bồi hoàn",
  "bội hoạt",
  "bội minh",
  "bội nhập",
  "bội phản",
  "bội phát",
  "bội phục",
  "bội suất",
  "bồi thẩm",
  "bồi thần",
  "bồi thực",
  "bồi tích",
  "bội tinh",
  "bôi trơn",
  "bồi trúc",
  "bội xuất",
  "bộn bàng",
  "bốn biển",
  "bồn binh",
  "bôn cạnh",
  "bốn chân",
  "bôn chôn",
  "bôn hành",
  "bốn mươi",
  "bộn nhộn",
  "bổn quan",
  "bổn thân",
  "bông bạc",
  "bông bèo",
  "bồng bột",
  "bông bụt",
  "bông cải",
  "bông đùa",
  "bông gạo",
  "bông gòn",
  "bông hoa",
  "bông lau",
  "bổng lộc",
  "bồng mạc",
  "bông tai",
  "bộng tằm",
  "bộp chộp",
  "bột báng",
  "bột chua",
  "bột giặt",
  "bột giấy",
  "bột khởi",
  "bột ngọt",
  "bột nhão",
  "bột phát",
  "bơ miệng",
  "bờ ruộng",
  "bơi bướm",
  "bơi đứng",
  "bơi ngửa",
  "bơi nhái",
  "bơi trải",
  "bới việc",
  "bờm chờm",
  "bơm điện",
  "bợm rượu",
  "bơm tiêm",
  "bơm xung",
  "bợn lòng",
  "bơn trải",
  "bợt chợt",
  "bớt nhớt",
  "bù loong",
  "búa chày",
  "búa chém",
  "búa chèn",
  "búa đanh",
  "búa đinh",
  "búa liềm",
  "búa quai",
  "bụi hồng",
  "bùi ngậy",
  "bùi ngùi",
  "bùi nhùi",
  "bụi phổi",
  "bụi trần",
  "bún bung",
  "bủn chủn",
  "bủn nhủn",
  "bún riêu",
  "bụng bầu",
  "bủng beo",
  "bủng bớt",
  "bùng bục",
  "bụng cóc",
  "bùng nền",
  "bụng ỏng",
  "bụng phệ",
  "bụng tàu",
  "buộc boa",
  "buộc néo",
  "buộc nút",
  "buộc tội",
  "buộc túm",
  "buổi sớm",
  "buổi tối",
  "buồm câu",
  "buồm dọc",
  "buồm lái",
  "buồm mũi",
  "buồm vẹt",
  "buôn bạc",
  "buôn bán",
  "buồn bực",
  "buôn cất",
  "buồn hiu",
  "buôn lậu",
  "buồn ngủ",
  "buồn nôn",
  "buồn rầu",
  "buồn teo",
  "buồn tủi",
  "buồng đẻ",
  "buột tay",
  "búp măng",
  "bút chổi",
  "bút danh",
  "bút điện",
  "bút hiệu",
  "bút lông",
  "bút pháp",
  "bút phớt",
  "bút tháp",
  "bút thần",
  "bút tích",
  "bút trận",
  "bừa ghim",
  "bừa phứa",
  "bừa răng",
  "bữa tiệc",
  "bức bách",
  "bức cung",
  "bức điện",
  "bức hàng",
  "bức hiếp",
  "bực mình",
  "bực thân",
  "bưng bít",
  "bưng mặt",
  "bước đầu",
  "bước hụt",
  "bước một",
  "bước qua",
  "bước vào",
  "bưởi đào",
  "bướm bạc",
  "bướm cải",
  "bướm đêm",
  "bướm ong",
  "bướm quế",
  "bướm sói",
  "bươn tới",
  "bướu khí",
  "bưu điện",
  "bưu kiện",
  "bưu phẩm",
  "cá chạch",
  "cá chẻng",
  "cá chiên",
  "cá chình",
  "cá chuối",
  "cá chuồn",
  "cà cuống",
  "cá giống",
  "cá mương",
  "cá ngạnh",
  "cá nhồng",
  "cà niễng",
  "ca nương",
  "cả quyết",
  "cà riềng",
  "cà roòng",
  "cá thiều",
  "cả tiếng",
  "cá trảnh",
  "cà trắng",
  "cá trích",
  "cá trổng",
  "cá tuyết",
  "ca xướng",
  "các ngài",
  "cách bức",
  "cạch cửa",
  "cách đều",
  "cách tân",
  "cách trí",
  "cách trở",
  "cách vời",
  "cái bang",
  "cải biên",
  "cải bông",
  "cải cách",
  "cải canh",
  "cải dạng",
  "cải danh",
  "cải dụng",
  "cái giấm",
  "cải hoán",
  "cải huấn",
  "cai ngục",
  "cài nhài",
  "cãi nhau",
  "cải nhậm",
  "cai quản",
  "cải táng",
  "cai thầu",
  "cải thìa",
  "cải tiến",
  "cai tổng",
  "cải trời",
  "cai tuần",
  "cải vồng",
  "cảm biến",
  "cám cảnh",
  "cam chịu",
  "cam công",
  "cam đoan",
  "cảm giác",
  "cam giấy",
  "cảm hoài",
  "cảm khái",
  "cảm kích",
  "cảm lạnh",
  "cảm nắng",
  "cảm nghĩ",
  "cam phận",
  "cam quýt",
  "cam sành",
  "cảm thán",
  "cam thảo",
  "cảm thấy",
  "cam thực",
  "cam tích",
  "cảm tình",
  "cản bước",
  "cạn chén",
  "can gián",
  "cạn hứng",
  "cạn khan",
  "càn khôn",
  "cạn kiệt",
  "can liên",
  "cạn lòng",
  "cản ngại",
  "can ngăn",
  "can phạm",
  "càn quấy",
  "càn quét",
  "càng cạc",
  "càng cua",
  "càng hay",
  "cảnh báo",
  "cánh bèo",
  "cạnh bên",
  "canh cải",
  "cánh cam",
  "cảnh cáo",
  "canh cặn",
  "cạnh cọt",
  "cành cơi",
  "cánh cửa",
  "canh cửi",
  "cánh dơi",
  "cạnh đáy",
  "cánh đều",
  "cảnh địa",
  "canh gác",
  "cảnh gần",
  "cảnh giả",
  "canh giờ",
  "canh giữ",
  "cánh hẩu",
  "cánh hữu",
  "cánh kéo",
  "cạnh khế",
  "cánh môi",
  "canh mục",
  "cảnh ngộ",
  "cánh nửa",
  "cánh sáo",
  "cảnh sát",
  "cảnh sắc",
  "cánh sen",
  "canh tác",
  "cánh tay",
  "cảnh thổ",
  "cánh trả",
  "cảnh trí",
  "cánh vảy",
  "cảnh vật",
  "cảnh vừa",
  "cảnh vực",
  "cánh xếp",
  "cáo bạch",
  "cáo bệnh",
  "cáo biệt",
  "cáo buộc",
  "cao công",
  "cáo cùng",
  "cao diệu",
  "cao dỏng",
  "cao đẳng",
  "cao điểm",
  "cao đỉnh",
  "cao đoán",
  "cáo giác",
  "cạo giấy",
  "cao hứng",
  "cao kiềm",
  "cao kiến",
  "cao luận",
  "cao ngạo",
  "cao ngâm",
  "cao ngất",
  "cao nghị",
  "cao nhớn",
  "cao niên",
  "cáo quan",
  "cao siêu",
  "cao tăng",
  "cao thâm",
  "cao trào",
  "cạo trọc",
  "cao tuổi",
  "cao vọng",
  "cáp điện",
  "cạp nong",
  "cạp quần",
  "cáp treo",
  "cát cánh",
  "cát đằng",
  "cát muôn",
  "cát nhân",
  "cát nhật",
  "cát táng",
  "cát vàng",
  "cau bụng",
  "cau điếc",
  "cáu ghét",
  "cáu kỉnh",
  "càu nhàu",
  "cáu sườn",
  "cáu tiết",
  "cau tươi",
  "cay đắng",
  "cày ngâm",
  "cày rang",
  "cảy tính",
  "cắm chốt",
  "căm ghét",
  "căm giận",
  "cắm sừng",
  "cắm trại",
  "căn bệnh",
  "cắn bóng",
  "căn cước",
  "cằn nhằn",
  "căn thức",
  "căn tính",
  "cắn trộm",
  "cẳng giò",
  "căng nọc",
  "căng sữa",
  "căng sức",
  "cẳng tay",
  "căng tin",
  "căng xác",
  "cặp giấy",
  "cặp lệch",
  "cặp lồng",
  "cặp mạch",
  "cắp nách",
  "cặp rằng",
  "cặp sách",
  "cặp thai",
  "cắt băng",
  "cắt giảm",
  "cắt họng",
  "cắt khúc",
  "cắt lượt",
  "cắt ngắn",
  "cắt ngọn",
  "cắt ruột",
  "cắt tiết",
  "cầm bằng",
  "cấm cách",
  "cầm càng",
  "cấm cẳón",
  "cầm chắc",
  "cầm chân",
  "cầm chèo",
  "cấm cung",
  "câm họng",
  "cấm khẩu",
  "câm lặng",
  "cấm lệnh",
  "cầm loan",
  "cấm ngặt",
  "cấm tiệt",
  "cẩn bạch",
  "cân bằng",
  "cận cảnh",
  "cân chìm",
  "cần dùng",
  "cận dưới",
  "cận điểm",
  "cận giáp",
  "cân nặng",
  "cân nhắc",
  "cận nhật",
  "cân quắc",
  "cận răng",
  "cẩn thận",
  "cận tiện",
  "cận tiếp",
  "cân trất",
  "cân treo",
  "cận trên",
  "cần trục",
  "cân xứng",
  "cấp bách",
  "cấp biến",
  "cập cách",
  "cấp dưới",
  "cấp điệu",
  "cấp hiệu",
  "cấp kênh",
  "cập nhật",
  "cấp nước",
  "cấp phát",
  "cấp thời",
  "cấp tính",
  "cấp trên",
  "cất binh",
  "cất bước",
  "cất chén",
  "cất chức",
  "cất công",
  "cất gánh",
  "cất giấu",
  "cất nhắc",
  "cất phần",
  "cất quân",
  "cất rượu",
  "cầu cảng",
  "cầu cạnh",
  "câu chấp",
  "cầu chúc",
  "cầu chui",
  "cầu cống",
  "cầu danh",
  "câu đằng",
  "câu giam",
  "cầu hàng",
  "cẩu hạnh",
  "cầu hiền",
  "cấu hình",
  "cầu khấn",
  "cầu khẩu",
  "cấu kiện",
  "cầu kiều",
  "câu lệnh",
  "câu liêm",
  "cầu lông",
  "cầu máng",
  "cầu mong",
  "cầu ngân",
  "câu nhạc",
  "câu nhắp",
  "cầu phao",
  "cầu phúc",
  "cầu quay",
  "cầu siêu",
  "câu thần",
  "câu thúc",
  "cầu tích",
  "cầu tiêu",
  "cầu toàn",
  "cầu treo",
  "cấu trúc",
  "cầu viện",
  "cầu vinh",
  "cầu vồng",
  "cầu vượt",
  "cây bông",
  "cây buồn",
  "cây cảnh",
  "cây chàm",
  "cấy chia",
  "cây điều",
  "cây đoác",
  "cấy ghép",
  "cây giun",
  "cây hàng",
  "cây nước",
  "cây phúc",
  "cây thảo",
  "cây thịt",
  "cây thóc",
  "cây thụt",
  "cây viết",
  "cây xăng",
  "chà bông",
  "chả chay",
  "chả chìa",
  "chà chôm",
  "chả chớt",
  "chả cuốn",
  "cha kiếp",
  "cha nuôi",
  "chả rươi",
  "chả viên",
  "chạc oạc",
  "chài bài",
  "chai dạn",
  "chai sạn",
  "chạm chờ",
  "chạm cốc",
  "chạm đất",
  "chạm ngõ",
  "chạm nọc",
  "chạm nổi",
  "chạm trổ",
  "chàm vàm",
  "chạm vía",
  "chán chê",
  "chán đời",
  "chan hoà",
  "chán mắt",
  "chán nản",
  "chán phè",
  "chán quá",
  "chán sức",
  "chán tai",
  "chán vạn",
  "chàng rể",
  "chánh sứ",
  "cháo bồi",
  "chao đảo",
  "chao đèn",
  "chào đón",
  "chào đời",
  "chảo đụn",
  "chào giá",
  "cháo hoa",
  "chào hỏi",
  "cháo lão",
  "chào mào",
  "chào mời",
  "chạo rạo",
  "cháo rau",
  "chào rơi",
  "cháo thí",
  "chao ươm",
  "chào xáo",
  "chạp phô",
  "chát xít",
  "chàu bạu",
  "chau mày",
  "cháu nhà",
  "cháu nội",
  "chạy bàn",
  "chạy bữa",
  "chạy cấn",
  "cháy chợ",
  "chày cối",
  "chạy của",
  "chạy dài",
  "chạy đàn",
  "chảy đất",
  "cháy đen",
  "chạy đua",
  "chạy gạo",
  "chạy gằn",
  "chạy hậu",
  "chạy lại",
  "cháy lụi",
  "chảy máu",
  "chạy máy",
  "chạy nọc",
  "cháy rụm",
  "chảy rữa",
  "cháy rực",
  "cháy sém",
  "chạy thi",
  "chạy tội",
  "cháy túi",
  "chạy vát",
  "chạy vạy",
  "chạy vèo",
  "chạy vụt",
  "chắc hẳn",
  "chắc lép",
  "chắc mẩm",
  "chắc mỏm",
  "chắc tay",
  "chăm bón",
  "chăm chỉ",
  "chăm chú",
  "chăm học",
  "chăm làm",
  "chăm nom",
  "chăm sóc",
  "chắn bùn",
  "chăn đơn",
  "chăn gối",
  "chặn hậu",
  "chăn sui",
  "chăn thả",
  "chẳng ai",
  "chẳng bõ",
  "chẳng bù",
  "chằng cò",
  "chẳng cứ",
  "chẳng dè",
  "chẳng gì",
  "chẳng hề",
  "chăng là",
  "chẳng lẽ",
  "chẳng lọ",
  "chẳng nề",
  "chăng tá",
  "chắp mối",
  "chắp nối",
  "chắp tay",
  "chắt bóp",
  "chặt chẽ",
  "chặt cụt",
  "chắt lọc",
  "chắt lót",
  "chắt mót",
  "chặt phá",
  "chặt tay",
  "chấm ảnh",
  "chấm bài",
  "châm bẩm",
  "chầm bập",
  "chẩm cầm",
  "chấm câu",
  "châm cứu",
  "chấm dôi",
  "chấm dứt",
  "chấm đen",
  "chấm hết",
  "chấm hỏi",
  "chậm lại",
  "chậm lụt",
  "chấm mút",
  "chấm phá",
  "chậm rãi",
  "chấm thi",
  "chậm trễ",
  "chầm vập",
  "chẩn bần",
  "chẩn cấp",
  "chân chỉ",
  "chân chó",
  "chần chừ",
  "chẩn cứu",
  "chân đất",
  "chân đầu",
  "chân đều",
  "chân đốt",
  "chân giả",
  "chân giò",
  "chấn lưu",
  "chân như",
  "chân què",
  "chân quì",
  "chân quỳ",
  "chân rết",
  "chân sào",
  "chân tay",
  "chân tâm",
  "chân tóc",
  "chẩn trị",
  "chân vạc",
  "chân váy",
  "chân vịt",
  "chân voi",
  "chân xác",
  "chấp bậc",
  "chấp bút",
  "chấp đơn",
  "chập tối",
  "chất béo",
  "chất bốc",
  "chất bột",
  "chất dẻo",
  "chất đạm",
  "chất đệm",
  "chất độc",
  "chất đốt",
  "chật hẹp",
  "chất keo",
  "chất khí",
  "chất khử",
  "chật lèn",
  "chất lưu",
  "chất men",
  "chật nứt",
  "chất rắn",
  "chất vấn",
  "chật vật",
  "chất xám",
  "châu đáo",
  "chầu hát",
  "chầu hầu",
  "châu lục",
  "châu luỵ",
  "châu mai",
  "chầu mồm",
  "châu mục",
  "châu phê",
  "chầu rìa",
  "châu thổ",
  "chầu văn",
  "chấy rận",
  "chè bạng",
  "chè bánh",
  "che bóng",
  "che chắn",
  "chè chén",
  "che giấu",
  "chè nhãn",
  "chè Thái",
  "chè tươi",
  "chè xanh",
  "chém bặp",
  "chẻm bẻm",
  "chèm bẹp",
  "chém cha",
  "chém mép",
  "chèn bẩy",
  "chen đua",
  "chen lấn",
  "chén mồi",
  "chén thề",
  "chèo bẻo",
  "chéo chó",
  "chèo đốc",
  "chèo hoa",
  "chèo kéo",
  "chèo lái",
  "chẻo lẻo",
  "chẻo mép",
  "chèo mũi",
  "chèo quế",
  "chèo vẻo",
  "chẹp bẹp",
  "chép tay",
  "chét tay",
  "chế biến",
  "chê cười",
  "chế định",
  "chế giễu",
  "chế khoa",
  "chế liệu",
  "chế nhạo",
  "chế pháp",
  "chế phẩm",
  "chế phục",
  "chế xuất",
  "chễm chệ",
  "chết cha",
  "chết đâm",
  "chết đói",
  "chết đòn",
  "chết già",
  "chết hụt",
  "chết khô",
  "chết mệt",
  "chết mòn",
  "chết não",
  "chết non",
  "chết nỗi",
  "chết oan",
  "chết rấp",
  "chết sớm",
  "chết toi",
  "chết xác",
  "chết yểu",
  "chi bằng",
  "chi biện",
  "chí chát",
  "chỉ châm",
  "chí chết",
  "chi chít",
  "chí choé",
  "chi chút",
  "chỉ chực",
  "chi dùng",
  "chi điếm",
  "chỉ định",
  "chi đoàn",
  "chỉ giáo",
  "chỉ giới",
  "chị Hằng",
  "chí hiếu",
  "chí hồng",
  "chỉ lệnh",
  "chí mạng",
  "chí nguy",
  "chí nhân",
  "chị nuôi",
  "chi phái",
  "chỉ sống",
  "chì than",
  "chỉ thắm",
  "chỉ thực",
  "chi tiết",
  "chi tiêu",
  "chí tình",
  "chia bài",
  "chia bào",
  "chia bâu",
  "chia bôi",
  "chia cắt",
  "chia đàn",
  "chia đều",
  "chia đốt",
  "chia hết",
  "chia lìa",
  "chia lửa"
];

// Danh sách từ hợp lệ để validate - 1500 từ
export const validWords = [
  // Cùng danh sách với targetWords để đơn giản, nhưng bạn có thể thêm từ khác vào đây
  ...targetWords
];

// Hàm lấy từ ngẫu nhiên để đoán
export const getRandomTargetWord = () => {
  const randomIndex = Math.floor(Math.random() * targetWords.length);
  return targetWords[randomIndex];
};

// Hàm kiểm tra từ có hợp lệ không
export const isValidWord = (word) => {
  const normalizedInput = normalize(word);
  return validWords.some(validWord => normalize(validWord) === normalizedInput);
};

// Hàm phân tích cấu trúc âm tiết
export const analyzeSyllableStructure = (originalWord) => {
  const syllables = originalWord.trim().split(/\s+/);
  if (syllables.length === 2) {
    const firstLen = syllables[0].length;
    const secondLen = syllables[1].length;
    return `Từ gồm 2 âm tiết: ${firstLen} chữ + ${secondLen} chữ`;
  } else if (syllables.length === 1) {
    return `Từ gồm 1 âm tiết: ${syllables[0].length} chữ`;
  }
  return `Từ gồm ${syllables.length} âm tiết`;
};