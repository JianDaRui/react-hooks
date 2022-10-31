import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLogo from "@/assets/react.svg";
const { Sider } = Layout;

const LayoutComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(["/use-state"]);
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "/use-state",
      icon: <UserOutlined />,
      label: "useState",
      onClick: () => navigate("/use-state"),
    },
    {
      key: "/use-effect",
      icon: <VideoCameraOutlined />,
      label: "useEffect",
      onClick: () => navigate("/use-effect"),
    },
    {
      key: "/use-context",
      icon: <UploadOutlined />,
      label: "useContext",
      onClick: () => navigate("/use-context"),
    },
  ];

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}            >
      <div
        style={{
          height: "64px",
          textAlign: "center",
          lineHeight: "64px",
          color: "#fff",
          fontWeight: 700,
        }}
        className="logo"
      >
        <img src={ReactLogo} alt="Logo" /> React Hooks
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["/use-state"]}
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={({ key }) => setSelectedKeys([key])}
      />
    </Sider>
  );
};

export default LayoutComponent;
